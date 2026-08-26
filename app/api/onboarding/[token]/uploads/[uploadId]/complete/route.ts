import { checkRateLimit, findOnboardingByToken, getDatabase } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson } from '@/lib/onboarding/http'
import { verifyUploadedObject } from '@/lib/onboarding/storage'

export const runtime = 'nodejs'

type Context = { params: Promise<{ token: string; uploadId: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token, uploadId } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const project = await findOnboardingByToken(token)
    if (!project) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const allowed = await checkRateLimit({ action: 'upload-complete', identity: `${project.tokenHash}:${getClientIp(request)}`, limit: 120 })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })

    const sql = getDatabase()
    const rows = await sql<{ id: string; mimeType: string; objectKey: string; size: number }[]>`
      select id, object_key as "objectKey", mime_type as "mimeType", size_bytes::int as size
      from onboarding_assets
      where id = ${uploadId} and project_id = ${project.id}
      limit 1
    `
    const upload = rows[0]
    if (!upload) return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })

    const object = await verifyUploadedObject(upload.objectKey, upload.mimeType)
    if (Number(object.head.ContentLength) !== upload.size) {
      return privateJson({ error: 'Nahratý súbor nemá očakávanú veľkosť.' }, { status: 422 })
    }
    if (!object.validType) {
      return privateJson({ error: 'Obsah súboru nezodpovedá povolenému typu.' }, { status: 422 })
    }

    await sql`
      update onboarding_assets set status = 'uploaded', uploaded_at = now()
      where id = ${upload.id} and project_id = ${project.id}
    `
    await sql`update onboarding_projects set updated_at = now(), last_activity_at = now() where id = ${project.id}`
    return privateJson({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
