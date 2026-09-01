import { createDownloadUrl } from '@/lib/onboarding/storage'
import { getDatabase } from '@/lib/onboarding/db'
import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { apiError, privateJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ assetId: string; projectId: string }> }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) {
    return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })
  }

  try {
    const { assetId, projectId } = await params
    if (!UUID_PATTERN.test(projectId) || !UUID_PATTERN.test(assetId)) {
      return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })
    }

    const sql = getDatabase()
    const rows = await sql<{ mimeType: string; name: string; objectKey: string }[]>`
      select original_filename as name, storage_key as "objectKey", mime_type as "mimeType"
      from onboarding_assets
      where id = ${assetId} and client_id = ${projectId} and status = 'uploaded'
      limit 1
    `
    const asset = rows[0]
    if (!asset) return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })

    const preview = new URL(request.url).searchParams.get('preview') === '1' && asset.mimeType.startsWith('image/')
    const downloadUrl = await createDownloadUrl(asset.objectKey, asset.name, preview ? 'inline' : 'attachment')
    const response = Response.redirect(downloadUrl, 303)
    response.headers.set('Cache-Control', 'no-store, private')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return response
  } catch (error) {
    return apiError(error)
  }
}
