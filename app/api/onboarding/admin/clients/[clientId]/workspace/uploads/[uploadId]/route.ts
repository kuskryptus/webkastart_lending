import { removeAsset } from '@/lib/onboarding/assets'
import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { getDatabase } from '@/lib/onboarding/db'
import { apiError, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { createDownloadUrl } from '@/lib/onboarding/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ clientId: string; uploadId: string }> }

function unauthorized() {
  return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })
}

export async function GET(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return unauthorized()
  try {
    const { clientId, uploadId } = await params
    const sql = getDatabase()
    const rows = await sql<{ mimeType: string; name: string; objectKey: string }[]>`
      select original_filename as name, storage_key as "objectKey", mime_type as "mimeType"
      from onboarding_assets
      where id = ${uploadId} and client_id = ${clientId} and status = 'uploaded'
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
    return apiError(error, { exposeDetails: true })
  }
}

export async function PATCH(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return unauthorized()
  try {
    const { clientId, uploadId } = await params
    const payload = await readSmallJson(request, 5_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const sql = getDatabase()
    const rows = await sql<{ id: string }[]>`
      update onboarding_assets
      set client_visible = ${body.clientVisible === true}, updated_at = now()
      where id = ${uploadId} and client_id = ${clientId}
      returning id
    `
    return rows[0]
      ? privateJson({ ok: true })
      : privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}

export async function DELETE(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return unauthorized()
  try {
    const { clientId, uploadId } = await params
    const removed = await removeAsset(clientId, uploadId)
    return removed
      ? privateJson({ ok: true })
      : privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}
