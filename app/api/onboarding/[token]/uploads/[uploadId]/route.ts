import { checkRateLimit, findOnboardingByToken, getDatabase } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson, privateRedirect } from '@/lib/onboarding/http'
import { removeAsset } from '@/lib/onboarding/assets'
import { createDownloadUrl } from '@/lib/onboarding/storage'
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
        and status = 'uploaded' and client_visible = true and asset_category = 'source'
      limit 1
    `
    const asset = rows[0]
    if (!asset) return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })
    const preview = new URL(request.url).searchParams.get('preview') === '1' && asset.mimeType.startsWith('image/')
    const url = await createDownloadUrl(asset.objectKey, asset.name, preview ? 'inline' : 'attachment')
    return privateRedirect(url)
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

    const removed = await removeAsset(project.clientId, uploadId, 'client')
    return removed
      ? privateJson({ ok: true })
      : privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })
  } catch (error) {
    return apiError(error)
  }
}
