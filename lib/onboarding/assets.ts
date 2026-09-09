import 'server-only'

import { randomUUID } from 'node:crypto'
import { getDatabase } from './db'
import {
  abortMultipartUpload,
  assertStorageConfigured,
  completeMultipartUpload,
  createMultipartPartUrls,
  createMultipartUpload,
  createUploadUrl,
  deleteUploadedObject,
  listMultipartParts,
  verifyUploadedObject,
} from './storage'
import {
  MAX_UPLOAD_FILES,
  MULTIPART_UPLOAD_PART_BYTES,
  MULTIPART_UPLOAD_THRESHOLD_BYTES,
  safeStorageFileName,
  validateUpload,
} from './validation'
import type { AssetCategory } from './types'
import { createAssetShareToken } from './asset-share'

export type AssetActor = 'client' | 'admin'

type PendingUpload = {
  id: string
  multipartUploadId: string | null
  objectKey: string
}

export async function createPendingAsset(options: {
  actor: AssetActor
  assetCategory: AssetCategory
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
  let upload: PendingUpload | undefined
  if (retryUploadId) {
    const rows = await sql<PendingUpload[]>`
      select id, storage_key as "objectKey", multipart_upload_id as "multipartUploadId"
      from onboarding_assets
      where id = ${retryUploadId} and client_id = ${options.clientId} and status = 'pending'
        and uploaded_by = ${options.actor}
        and asset_category = ${options.assetCategory}
        and original_filename = ${String(options.body.name)}
        and mime_type = ${validation.mimeType}
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
      return transaction<PendingUpload[]>`
        insert into onboarding_assets (
          project_id, client_id, storage_key, original_filename, mime_type, size,
          uploaded_by, client_visible, asset_category
        ) values (
          ${options.projectId}, ${options.clientId}, ${objectKey}, ${String(options.body.name)},
          ${validation.mimeType}, ${Number(options.body.size)}, ${options.actor},
          ${options.clientVisible}, ${options.assetCategory}
        )
        returning id, storage_key as "objectKey", multipart_upload_id as "multipartUploadId"
      `
    }) as PendingUpload[]
    if (!rows[0]) return { error: `Môžete nahrať najviac ${MAX_UPLOAD_FILES} súborov.` } as const
    upload = rows[0]
  }

  if (Number(options.body.size) > MULTIPART_UPLOAD_THRESHOLD_BYTES) {
    let multipartUploadId = upload.multipartUploadId
    let uploadedParts: Array<{ partNumber: number; size: number }> = []

    if (multipartUploadId) {
      try {
        uploadedParts = (await listMultipartParts(upload.objectKey, multipartUploadId))
          .map(({ partNumber, size }) => ({ partNumber, size }))
      } catch {
        multipartUploadId = null
      }
    }

    if (!multipartUploadId) {
      multipartUploadId = await createMultipartUpload(upload.objectKey, validation.mimeType)
      try {
        await sql`
          update onboarding_assets set multipart_upload_id = ${multipartUploadId}, updated_at = now()
          where id = ${upload.id} and client_id = ${options.clientId} and status = 'pending'
        `
      } catch (error) {
        await abortMultipartUpload(upload.objectKey, multipartUploadId).catch(() => undefined)
        throw error
      }
    }

    return {
      mimeType: validation.mimeType,
      mode: 'multipart' as const,
      partSize: MULTIPART_UPLOAD_PART_BYTES,
      uploadId: upload.id,
      uploadedParts,
    }
  }

  const uploadUrl = await createUploadUrl({
    key: upload.objectKey,
    mimeType: validation.mimeType,
  })
  return { mimeType: validation.mimeType, mode: 'single' as const, uploadId: upload.id, uploadUrl } as const
}

export async function createPartUrlsForPendingAsset(options: {
  actor: AssetActor
  assetId: string
  clientId: string
  partNumbers: unknown
}) {
  const sql = getDatabase()
  const rows = await sql<{
    multipartUploadId: string
    objectKey: string
    size: number
  }[]>`
    select storage_key as "objectKey", multipart_upload_id as "multipartUploadId", size::float8 as size
    from onboarding_assets
    where id = ${options.assetId} and client_id = ${options.clientId} and status = 'pending'
      and uploaded_by = ${options.actor} and multipart_upload_id is not null
    limit 1
  `
  const upload = rows[0]
  if (!upload) return { error: 'Rozpracované nahrávanie sa nenašlo.', status: 404 } as const

  const maxPartNumber = Math.ceil(upload.size / MULTIPART_UPLOAD_PART_BYTES)
  const partNumbers = Array.isArray(options.partNumbers)
    ? [...new Set(options.partNumbers)]
      .filter((value): value is number => Number.isSafeInteger(value) && value >= 1 && value <= maxPartNumber)
      .slice(0, 12)
    : []
  if (!partNumbers.length) return { error: 'Časti súboru nie sú platné.', status: 422 } as const

  return {
    parts: await createMultipartPartUrls({
      key: upload.objectKey,
      partNumbers,
      uploadId: upload.multipartUploadId,
    }),
  } as const
}

export async function completePendingAsset(clientId: string, assetId: string, actor?: AssetActor) {
  const sql = getDatabase()
  const rows = await sql<{
    id: string
    mimeType: string
    multipartUploadId: string | null
    objectKey: string
    size: number
    status: 'pending' | 'uploaded'
  }[]>`
    select id, storage_key as "objectKey", mime_type as "mimeType", size::float8 as size,
      status, multipart_upload_id as "multipartUploadId"
    from onboarding_assets
    where id = ${assetId} and client_id = ${clientId}
      and (${actor ?? null}::text is null or uploaded_by = ${actor ?? null})
    limit 1
  `
  const upload = rows[0]
  if (!upload) return { error: 'Súbor sa nenašiel.', status: 404 } as const
  if (upload.status === 'uploaded') {
    return { ok: true, shareToken: upload.mimeType.startsWith('image/') ? createAssetShareToken(assetId) : null } as const
  }

  if (upload.multipartUploadId) {
    const parts = await listMultipartParts(upload.objectKey, upload.multipartUploadId)
    const expectedParts = Math.ceil(upload.size / MULTIPART_UPLOAD_PART_BYTES)
    const validParts = parts.length === expectedParts && parts.every((part, index) => {
      const expectedSize = index === expectedParts - 1
        ? upload.size - (expectedParts - 1) * MULTIPART_UPLOAD_PART_BYTES
        : MULTIPART_UPLOAD_PART_BYTES
      return part.partNumber === index + 1 && part.size === expectedSize
    })
    if (!validParts) {
      return { error: 'Niektoré časti súboru chýbajú. Skúste nahrávanie obnoviť.', status: 422 } as const
    }
    await completeMultipartUpload(upload.objectKey, upload.multipartUploadId, parts)
  }

  const object = await verifyUploadedObject(upload.objectKey, upload.mimeType)
  if (Number(object.head.ContentLength) !== upload.size) {
    return { error: 'Nahratý súbor nemá očakávanú veľkosť.', status: 422 } as const
  }
  if (!object.validType) {
    return { error: 'Obsah súboru nezodpovedá povolenému typu.', status: 422 } as const
  }
  await sql.begin(async (transaction) => {
    await transaction`
      update onboarding_assets
      set status = 'uploaded', multipart_upload_id = null, uploaded_at = now(), updated_at = now()
      where id = ${assetId} and client_id = ${clientId}
    `
    await transaction`update onboarding_projects set updated_at = now(), last_activity_at = now() where client_id = ${clientId}`
    await transaction`update clients set updated_at = now() where id = ${clientId}`
  })
  return { ok: true, shareToken: upload.mimeType.startsWith('image/') ? createAssetShareToken(assetId) : null } as const
}

export async function removeAsset(clientId: string, assetId: string, actor?: AssetActor) {
  const sql = getDatabase()
  const rows = await sql<{ multipartUploadId: string | null; objectKey: string; uploadedBy: AssetActor }[]>`
    select storage_key as "objectKey", uploaded_by as "uploadedBy",
      multipart_upload_id as "multipartUploadId"
    from onboarding_assets
    where id = ${assetId} and client_id = ${clientId}
    limit 1
  `
  const asset = rows[0]
  if (!asset || (actor && asset.uploadedBy !== actor)) return false
  if (asset.multipartUploadId) {
    await abortMultipartUpload(asset.objectKey, asset.multipartUploadId).catch(() => undefined)
  }
  await deleteUploadedObject(asset.objectKey)
  await sql.begin(async (transaction) => {
    await transaction`delete from onboarding_assets where id = ${assetId} and client_id = ${clientId}`
    await transaction`update clients set updated_at = now() where id = ${clientId}`
  })
  return true
}
