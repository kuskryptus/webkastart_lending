import 'server-only'

import { randomUUID } from 'node:crypto'
import { getDatabase } from './db'
import { assertStorageConfigured, createUploadUrl, deleteUploadedObject, verifyUploadedObject } from './storage'
import { MAX_UPLOAD_FILES, safeStorageFileName, validateUpload } from './validation'

export type AssetActor = 'client' | 'admin'

export async function createPendingAsset(options: {
  actor: AssetActor
  body: Record<string, unknown>
  clientId: string
  clientVisible: boolean
  projectId: string
}) {
  const validation = validateUpload(options.body.name, options.body.mimeType, options.body.size)
  if ('error' in validation) return { error: validation.error } as const

  assertStorageConfigured()
  const sql = getDatabase()
  const retryUploadId = typeof options.body.retryUploadId === 'string' ? options.body.retryUploadId : ''
  let upload: { id: string; objectKey: string } | undefined
  if (retryUploadId) {
    const rows = await sql<{ id: string; objectKey: string }[]>`
      select id, storage_key as "objectKey"
      from onboarding_assets
      where id = ${retryUploadId} and client_id = ${options.clientId} and status = 'pending'
        and uploaded_by = ${options.actor}
        and original_filename = ${String(options.body.name)}
        and mime_type = ${String(options.body.mimeType)}
        and size = ${Number(options.body.size)}
      limit 1
    `
    upload = rows[0]
  }

  if (!upload) {
    const rows = await sql.begin(async (transaction) => {
      await transaction`select id from clients where id = ${options.clientId} for update`
      const countRows = await transaction<{ count: number }[]>`
        select count(*)::int as count from onboarding_assets where client_id = ${options.clientId}
      `
      if ((countRows[0]?.count ?? MAX_UPLOAD_FILES) >= MAX_UPLOAD_FILES) return []
      const fileName = safeStorageFileName(String(options.body.name), validation.extension)
      const objectKey = `clients/${options.clientId}/uploads/${randomUUID()}-${fileName}`
      return transaction<{ id: string; objectKey: string }[]>`
        insert into onboarding_assets (
          project_id, client_id, storage_key, original_filename, mime_type, size,
          uploaded_by, client_visible
        ) values (
          ${options.projectId}, ${options.clientId}, ${objectKey}, ${String(options.body.name)},
          ${String(options.body.mimeType)}, ${Number(options.body.size)}, ${options.actor},
          ${options.clientVisible}
        )
        returning id, storage_key as "objectKey"
      `
    }) as { id: string; objectKey: string }[]
    if (!rows[0]) return { error: `Môžete nahrať najviac ${MAX_UPLOAD_FILES} súborov.` } as const
    upload = rows[0]
  }

  const uploadUrl = await createUploadUrl({
    key: upload.objectKey,
    mimeType: String(options.body.mimeType),
    size: Number(options.body.size),
  })
  return { uploadId: upload.id, uploadUrl } as const
}

export async function completePendingAsset(clientId: string, assetId: string, actor?: AssetActor) {
  const sql = getDatabase()
  const rows = await sql<{ id: string; mimeType: string; objectKey: string; size: number }[]>`
    select id, storage_key as "objectKey", mime_type as "mimeType", size::int as size
    from onboarding_assets
    where id = ${assetId} and client_id = ${clientId}
      and (${actor ?? null}::text is null or uploaded_by = ${actor ?? null})
    limit 1
  `
  const upload = rows[0]
  if (!upload) return { error: 'Súbor sa nenašiel.', status: 404 } as const
  const object = await verifyUploadedObject(upload.objectKey, upload.mimeType)
  if (Number(object.head.ContentLength) !== upload.size) {
    return { error: 'Nahratý súbor nemá očakávanú veľkosť.', status: 422 } as const
  }
  if (!object.validType) {
    return { error: 'Obsah súboru nezodpovedá povolenému typu.', status: 422 } as const
  }
  await sql.begin(async (transaction) => {
    await transaction`
      update onboarding_assets set status = 'uploaded', uploaded_at = now(), updated_at = now()
      where id = ${assetId} and client_id = ${clientId}
    `
    await transaction`update onboarding_projects set updated_at = now(), last_activity_at = now() where client_id = ${clientId}`
    await transaction`update clients set updated_at = now() where id = ${clientId}`
  })
  return { ok: true } as const
}

export async function removeAsset(clientId: string, assetId: string, actor?: AssetActor) {
  const sql = getDatabase()
  const rows = await sql<{ objectKey: string; uploadedBy: AssetActor }[]>`
    select storage_key as "objectKey", uploaded_by as "uploadedBy"
    from onboarding_assets
    where id = ${assetId} and client_id = ${clientId}
    limit 1
  `
  const asset = rows[0]
  if (!asset || (actor && asset.uploadedBy !== actor)) return false
  await deleteUploadedObject(asset.objectKey)
  await sql.begin(async (transaction) => {
    await transaction`delete from onboarding_assets where id = ${assetId} and client_id = ${clientId}`
    await transaction`update clients set updated_at = now() where id = ${clientId}`
  })
  return true
}
