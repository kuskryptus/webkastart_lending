import { removeAsset, renameAsset } from '@/lib/onboarding/assets'
import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { getDatabase } from '@/lib/onboarding/db'
import { apiError, privateJson, privateRedirect, readSmallJson } from '@/lib/onboarding/http'
import { createAssetReadUrl } from '@/lib/onboarding/storage'

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
    const url = await createAssetReadUrl({
      disposition: preview ? 'inline' : 'attachment',
      key: asset.objectKey,
      mimeType: asset.mimeType,
      originalName: asset.name,
      preview,
    })
    return privateRedirect(url)
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
    const hasClientVisibility = typeof body.clientVisible === 'boolean'
    const hasName = Object.prototype.hasOwnProperty.call(body, 'name')
    if (!hasClientVisibility && !hasName) {
      return privateJson({ error: 'Nie je čo zmeniť.' }, { status: 422 })
    }

    let renamedName: string | undefined
    if (hasName) {
      const renamed = await renameAsset(clientId, uploadId, body.name)
      if ('error' in renamed) return privateJson({ error: renamed.error }, { status: renamed.status })
      renamedName = renamed.name
    }

    if (!hasClientVisibility) {
      return privateJson({ name: renamedName })
    }

    const sql = getDatabase()
    const rows = await sql<{ id: string; name: string }[]>`
      update onboarding_assets
      set client_visible = ${body.clientVisible === true}, updated_at = now()
      where id = ${uploadId} and client_id = ${clientId}
      returning id, original_filename as name
    `
    return rows[0]
      ? privateJson({ name: rows[0].name, ok: true })
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
