import 'server-only'

import { createHash, randomBytes, randomUUID } from 'node:crypto'
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

export async function createOnboardingProject(clientLabel: string) {
  const sql = getDatabase()
  const token = randomBytes(32).toString('base64url')
  const tokenHash = hashOnboardingToken(token)
  const clientId = randomUUID()
  const rows = await sql.begin(async (transaction) => {
    await transaction`
      insert into clients (id, display_name, portal_token_hash)
      values (${clientId}, ${clientLabel}, ${tokenHash})
    `
    const projects = await transaction<{ createdAt: Date; id: string }[]>`
      insert into onboarding_projects (id, client_id, client_label, token_hash)
      values (${clientId}, ${clientId}, ${clientLabel}, ${tokenHash})
      returning client_id as id, created_at as "createdAt"
    `
    await transaction`
      insert into discovery_2_forms (client_id, token_hash)
      values (${clientId}, ${createHash('sha256').update(randomBytes(32)).digest('hex')})
    `
    await transaction`
      insert into client_workspace_sections (client_id, section_key, client_visible, client_editable)
      values
        (${clientId}, 'core', true, true),
        (${clientId}, 'discovery_2', true, true),
        (${clientId}, 'files', true, true),
        (${clientId}, 'creative_strategy', false, false),
        (${clientId}, 'creative_directions', false, false),
        (${clientId}, 'internal_notes', false, false)
    `
    return projects
  }) as { createdAt: Date; id: string }[]
  const project = rows[0]
  if (!project) throw new Error('Could not create onboarding project')
  return { ...project, token }
}

export async function listOnboardingProjects() {
  const sql = getDatabase()
  return sql<{
    clientLabel: string
    createdAt: Date
    currentStep: number
    id: string
    lastActivityAt: Date
    status: OnboardingStatus
    submittedAt: Date | null
  }[]>`
    select
      client.id,
      client.display_name as "clientLabel",
      project.status,
      project.current_step as "currentStep",
      client.created_at as "createdAt",
      client.updated_at as "lastActivityAt",
      project.submitted_at as "submittedAt"
    from clients as client
    join onboarding_projects as project on project.client_id = client.id
    order by client.created_at desc
    limit 200
  `
}

export type OnboardingProjectRecord = {
  id: string
  clientId: string
  clientLabel: string
  tokenHash: string
  status: OnboardingStatus
  currentStep: number
  revision: number
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
      client_id as "clientId",
      client_label as "clientLabel",
      token_hash as "tokenHash",
      status,
      current_step as "currentStep",
      revision::int as revision,
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

export async function findCoreOnboardingByClientId(clientId: string): Promise<OnboardingProjectRecord | null> {
  const sql = getDatabase()
  const rows = await sql<OnboardingProjectRecord[]>`
    select
      id,
      client_id as "clientId",
      client_label as "clientLabel",
      token_hash as "tokenHash",
      status,
      current_step as "currentStep",
      revision::int as revision,
      answers,
      created_at as "createdAt",
      updated_at as "updatedAt",
      last_activity_at as "lastActivityAt",
      submitted_at as "submittedAt"
    from onboarding_projects
    where client_id = ${clientId}
    limit 1
  `
  return rows[0] ?? null
}

export async function listAssets(clientId: string): Promise<OnboardingAsset[]> {
  const sql = getDatabase()
  return sql<OnboardingAsset[]>`
    select
      id,
      original_filename as name,
      mime_type as "mimeType",
      size::int as size,
      status,
      created_at as "createdAt",
      uploaded_by as "uploadedBy",
      client_visible as "clientVisible"
    from onboarding_assets
    where client_id = ${clientId}
    order by created_at asc
  `
}

export async function saveOnboarding(
  projectId: string,
  answers: OnboardingAnswers,
  currentStep: number,
  reopen = false,
  expectedRevision?: number,
) {
  const sql = getDatabase()
  return sql.begin(async (transaction) => {
    const rows = await transaction<{ clientId: string; revision: number }[]>`
      update onboarding_projects
      set
        answers = ${transaction.json(answers as unknown as postgres.JSONValue)},
        current_step = ${currentStep},
        status = case
          when ${reopen} then 'in_progress'
          when status = 'not_started' then 'in_progress'
          else status
        end,
        submitted_at = case when ${reopen} then null else submitted_at end,
        revision = revision + 1,
        updated_at = now(),
        last_activity_at = now()
      where id = ${projectId}
        and (${expectedRevision ?? null}::bigint is null or revision = ${expectedRevision ?? null})
      returning client_id as "clientId", revision::int as revision
    `
    if (rows[0]) await transaction`update clients set updated_at = now() where id = ${rows[0].clientId}`
    return rows[0] ?? null
  }) as Promise<{ clientId: string; revision: number } | null>
}

export async function submitOnboarding(projectId: string, answers: OnboardingAnswers, expectedRevision?: number) {
  const sql = getDatabase()
  return sql.begin(async (transaction) => {
    const rows = await transaction<{ clientId: string; revision: number }[]>`
      update onboarding_projects
      set
        answers = ${transaction.json(answers as unknown as postgres.JSONValue)},
        current_step = 6,
        status = 'submitted',
        submitted_at = coalesce(submitted_at, now()),
        revision = revision + 1,
        updated_at = now(),
        last_activity_at = now()
      where id = ${projectId}
        and (${expectedRevision ?? null}::bigint is null or revision = ${expectedRevision ?? null})
      returning client_id as "clientId", revision::int as revision
    `
    if (rows[0]) await transaction`update clients set updated_at = now() where id = ${rows[0].clientId}`
    return rows[0] ?? null
  }) as Promise<{ clientId: string; revision: number } | null>
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
