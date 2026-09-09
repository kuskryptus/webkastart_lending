import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { getDatabase } from './db'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export type SharedAsset = {
  id: string
  mimeType: string
  name: string
  objectKey: string
  size: number
}

function shareSecret() {
  const secret = process.env.ONBOARDING_ASSET_SHARE_SECRET
    || process.env.ONBOARDING_PORTAL_LINK_SECRET
    || process.env.ONBOARDING_ADMIN_SECRET
  return secret && secret.length >= 16 ? secret : null
}

export function createAssetShareToken(assetId: string) {
  const secret = shareSecret()
  if (!secret || !UUID_PATTERN.test(assetId)) return null
  return createHmac('sha256', secret)
    .update(`webkastart-shared-asset-v1:${assetId}`)
    .digest('base64url')
}

export function isValidAssetShareToken(assetId: string, token: string) {
  if (!UUID_PATTERN.test(assetId) || !SHARE_TOKEN_PATTERN.test(token)) return false
  const expected = createAssetShareToken(assetId)
  if (!expected) return false
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

export async function findSharedAsset(assetId: string, token: string): Promise<SharedAsset | null> {
  if (!isValidAssetShareToken(assetId, token)) return null
  const sql = getDatabase()
  const rows = await sql<SharedAsset[]>`
    select
      asset.id,
      asset.original_filename as name,
      asset.mime_type as "mimeType",
      asset.storage_key as "objectKey",
      asset.size::float8 as size
    from onboarding_assets as asset
    join client_workspace_sections as section
      on section.client_id = asset.client_id
      and section.section_key = case
        when asset.asset_category = 'deliverable' then 'deliverables'
        else 'files'
      end
    where asset.id = ${assetId}
      and asset.status = 'uploaded'
      and asset.client_visible = true
      and section.client_visible = true
    limit 1
  `
  return rows[0] ?? null
}
