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

export type SharedImageComment = {
  id: string
  authorName: string
  body: string
  positionX: number
  positionY: number
  createdAt: Date
  resolvedAt: Date | null
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

export async function listSharedImageComments(assetId: string): Promise<SharedImageComment[]> {
  const sql = getDatabase()
  return sql<SharedImageComment[]>`
    select
      comment.id,
      comment.author_name as "authorName",
      comment.body,
      comment.position_x as "positionX",
      comment.position_y as "positionY",
      comment.created_at as "createdAt",
      comment.resolved_at as "resolvedAt"
    from (
      select *
      from shared_image_comments
      where asset_id = ${assetId}
      order by created_at desc, id desc
      limit 500
    ) as comment
    order by comment.created_at asc, comment.id asc
  `
}

export async function createSharedImageComment(input: {
  assetId: string
  authorName: string
  body: string
  positionX: number
  positionY: number
}): Promise<SharedImageComment> {
  const sql = getDatabase()
  const comment = await sql.begin(async (transaction) => {
    const rows = await transaction<SharedImageComment[]>`
      insert into shared_image_comments (
        asset_id,
        author_name,
        body,
        position_x,
        position_y
      ) values (
        ${input.assetId},
        ${input.authorName},
        ${input.body},
        ${input.positionX},
        ${input.positionY}
      )
      returning
        id,
        author_name as "authorName",
        body,
        position_x as "positionX",
        position_y as "positionY",
        created_at as "createdAt",
        resolved_at as "resolvedAt"
    `
    await transaction`
      update clients
      set updated_at = now()
      where id = (select client_id from onboarding_assets where id = ${input.assetId})
    `
    return rows[0]
  }) as SharedImageComment | undefined
  if (!comment) throw new Error('Could not create shared image comment')
  return comment
}

export async function updateSharedImageComment(input: {
  assetId: string
  commentId: string
  authorName: string
  body: string
}): Promise<SharedImageComment | null> {
  const sql = getDatabase()
  return sql.begin(async (transaction) => {
    const rows = await transaction<SharedImageComment[]>`
      update shared_image_comments
      set
        author_name = ${input.authorName},
        body = ${input.body}
      where id = ${input.commentId}
        and asset_id = ${input.assetId}
      returning
        id,
        author_name as "authorName",
        body,
        position_x as "positionX",
        position_y as "positionY",
        created_at as "createdAt",
        resolved_at as "resolvedAt"
    `
    if (!rows[0]) return null

    await transaction`
      update clients
      set updated_at = now()
      where id = (select client_id from onboarding_assets where id = ${input.assetId})
    `
    return rows[0]
  }) as Promise<SharedImageComment | null>
}

export async function setSharedImageCommentResolved(input: {
  assetId: string
  commentId: string
  resolved: boolean
}): Promise<SharedImageComment | null> {
  const sql = getDatabase()
  return sql.begin(async (transaction) => {
    const rows = await transaction<SharedImageComment[]>`
      update shared_image_comments
      set resolved_at = case when ${input.resolved} then now() else null end
      where id = ${input.commentId}
        and asset_id = ${input.assetId}
      returning
        id,
        author_name as "authorName",
        body,
        position_x as "positionX",
        position_y as "positionY",
        created_at as "createdAt",
        resolved_at as "resolvedAt"
    `
    if (!rows[0]) return null

    await transaction`
      update clients
      set updated_at = now()
      where id = (select client_id from onboarding_assets where id = ${input.assetId})
    `
    return rows[0]
  }) as Promise<SharedImageComment | null>
}

export async function deleteSharedImageComment(input: {
  assetId: string
  commentId: string
}): Promise<boolean> {
  const sql = getDatabase()
  return sql.begin(async (transaction) => {
    const rows = await transaction<{ id: string }[]>`
      delete from shared_image_comments
      where id = ${input.commentId}
        and asset_id = ${input.assetId}
      returning id
    `
    if (!rows[0]) return false

    await transaction`
      update clients
      set updated_at = now()
      where id = (select client_id from onboarding_assets where id = ${input.assetId})
    `
    return true
  }) as Promise<boolean>
}
