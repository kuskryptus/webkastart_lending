import { removeAsset } from '@/lib/onboarding/assets'
import { getDatabase } from '@/lib/onboarding/db'
import { apiError, privateJson } from '@/lib/onboarding/http'
import { authorizePortalRequest } from '@/lib/onboarding/portal-auth'
import { createDownloadUrl } from '@/lib/onboarding/storage'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ token: string; uploadId: string }> }

export async function GET(request: Request, { params }: Context) {
  try {
    const { token, uploadId } = await params
    const auth = await authorizePortalRequest(request, token, 'portal-file-read')
    if ('response' in auth) return auth.response
    const permission = await getWorkspaceSection(auth.client.id, 'files')
    if (!permission?.clientVisible) return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })
    const sql = getDatabase()
    const rows = await sql<{ mimeType: string; name: string; objectKey: string }[]>`
      select original_filename as name, storage_key as "objectKey", mime_type as "mimeType"
      from onboarding_assets
      where id = ${uploadId} and client_id = ${auth.client.id}
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
    const auth = await authorizePortalRequest(request, token, 'portal-file-delete', 60)
    if ('response' in auth) return auth.response
    const permission = await getWorkspaceSection(auth.client.id, 'files')
    if (!permission?.clientEditable) return privateJson({ error: 'Odstraňovanie súborov nie je povolené.' }, { status: 403 })
    const removed = await removeAsset(auth.client.id, uploadId, 'client')
    return removed
      ? privateJson({ ok: true })
      : privateJson({ error: 'Môžete odstrániť iba súbory, ktoré ste nahrali.' }, { status: 403 })
  } catch (error) {
    return apiError(error)
  }
}
