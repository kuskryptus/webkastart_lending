import { checkRateLimit, findOnboardingByToken, getDatabase } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson } from '@/lib/onboarding/http'
import { createDownloadUrl, deleteUploadedObject } from '@/lib/onboarding/storage'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ token: string; uploadId: string }> }

export async function GET(request: Request, { params }: Context) {
  try {
    const { token, uploadId } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const project = await findOnboardingByToken(token)
    if (!project) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const permission = await getWorkspaceSection(project.clientId, 'files')
    if (!permission?.clientVisible) return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })
    const allowed = await checkRateLimit({ action: 'file-read', identity: `${project.tokenHash}:${getClientIp(request)}`, limit: 180 })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })

    const sql = getDatabase()
    const rows = await sql<{ mimeType: string; name: string; objectKey: string }[]>`
      select original_filename as name, storage_key as "objectKey", mime_type as "mimeType"
      from onboarding_assets
      where id = ${uploadId} and client_id = ${project.clientId}
        and status = 'uploaded' and client_visible = true
      limit 1
    `
    const asset = rows[0]
    if (!asset) return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })
    const preview = new URL(request.url).searchParams.get('preview') === '1' && asset.mimeType.startsWith('image/')
    const url = await createDownloadUrl(asset.objectKey, asset.name, preview ? 'inline' : 'attachment')
    const response = Response.redirect(url, 303)
    response.headers.set('Cache-Control', 'no-store, private')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return response
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { token, uploadId } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const project = await findOnboardingByToken(token)
    if (!project) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const permission = await getWorkspaceSection(project.clientId, 'files')
    if (!permission?.clientEditable) {
      return privateJson({ error: 'Odstraňovanie súborov nie je povolené.' }, { status: 403 })
    }
    const allowed = await checkRateLimit({ action: 'upload-delete', identity: `${project.tokenHash}:${getClientIp(request)}`, limit: 60 })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })

    const sql = getDatabase()
    const rows = await sql<{ objectKey: string }[]>`
      select storage_key as "objectKey" from onboarding_assets
      where id = ${uploadId} and client_id = ${project.clientId} and uploaded_by = 'client'
      limit 1
    `
    const upload = rows[0]
    if (!upload) return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })

    await deleteUploadedObject(upload.objectKey)
    await sql`delete from onboarding_assets where id = ${uploadId} and client_id = ${project.clientId}`
    await sql`update onboarding_projects set updated_at = now(), last_activity_at = now() where id = ${project.id}`
    await sql`update clients set updated_at = now() where id = ${project.clientId}`
    return privateJson({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
