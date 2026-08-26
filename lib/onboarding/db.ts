import 'server-only'

import { createHash } from 'node:crypto'
import postgres, { type Sql } from 'postgres'
import type { OnboardingAnswers, OnboardingAsset, OnboardingStatus } from './types'

let database: Sql | undefined

export function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  database ??= postgres(process.env.DATABASE_URL, {
    max: Number(process.env.DATABASE_POOL_SIZE || 5),
    prepare: false,
    ssl: process.env.DATABASE_SSL === 'false' ? false : 'require',
  })

  return database
}

export function hashOnboardingToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export type OnboardingProjectRecord = {
  id: string
  clientLabel: string
  tokenHash: string
  status: OnboardingStatus
  currentStep: number
  answers: OnboardingAnswers
  createdAt: Date
  updatedAt: Date
  lastActivityAt: Date
  submittedAt: Date | null
}

export async function findOnboardingByToken(token: string): Promise<OnboardingProjectRecord | null> {
  const sql = getDatabase()
  const tokenHash = hashOnboardingToken(token)
  const rows = await sql<OnboardingProjectRecord[]>`
    select
      id,
      client_label as "clientLabel",
      token_hash as "tokenHash",
      status,
      current_step as "currentStep",
      answers,
      created_at as "createdAt",
      updated_at as "updatedAt",
      last_activity_at as "lastActivityAt",
      submitted_at as "submittedAt"
    from onboarding_projects
    where token_hash = ${tokenHash}
    limit 1
  `
  return rows[0] ?? null
}

export async function listAssets(projectId: string): Promise<OnboardingAsset[]> {
  const sql = getDatabase()
  return sql<OnboardingAsset[]>`
    select
      id,
      original_name as name,
      mime_type as "mimeType",
      size_bytes::int as size,
      status,
      created_at as "createdAt"
    from onboarding_assets
    where project_id = ${projectId}
    order by created_at asc
  `
}

export async function saveOnboarding(
  projectId: string,
  answers: OnboardingAnswers,
  currentStep: number,
) {
  const sql = getDatabase()
  await sql`
    update onboarding_projects
    set
      answers = ${sql.json(answers as unknown as postgres.JSONValue)},
      current_step = ${currentStep},
      status = case when status = 'not_started' then 'in_progress' else status end,
      updated_at = now(),
      last_activity_at = now()
    where id = ${projectId}
  `
}

export async function submitOnboarding(projectId: string, answers: OnboardingAnswers) {
  const sql = getDatabase()
  await sql`
    update onboarding_projects
    set
      answers = ${sql.json(answers as unknown as postgres.JSONValue)},
      current_step = 6,
      status = 'submitted',
      submitted_at = coalesce(submitted_at, now()),
      updated_at = now(),
      last_activity_at = now()
    where id = ${projectId}
  `
}

export async function checkRateLimit(options: {
  action: string
  identity: string
  limit: number
}) {
  const sql = getDatabase()
  const bucket = new Date(Math.floor(Date.now() / 60_000) * 60_000)
  const key = createHash('sha256')
    .update(`${options.action}:${options.identity}:${process.env.ONBOARDING_RATE_LIMIT_SECRET || ''}`)
    .digest('hex')

  const rows = await sql<{ requestCount: number }[]>`
    insert into onboarding_rate_limits (rate_key, window_start, request_count)
    values (${key}, ${bucket}, 1)
    on conflict (rate_key, window_start)
    do update set request_count = onboarding_rate_limits.request_count + 1
    returning request_count as "requestCount"
  `

  return (rows[0]?.requestCount ?? options.limit + 1) <= options.limit
}

export async function pruneRateLimits() {
  const sql = getDatabase()
  if (Math.random() > 0.02) return
  await sql`delete from onboarding_rate_limits where window_start < now() - interval '1 day'`
}
