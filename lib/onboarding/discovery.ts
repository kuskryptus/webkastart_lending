import 'server-only'

import { randomBytes } from 'node:crypto'
import type { Discovery2Answers, OnboardingStatus } from './types'
import { getDatabase, hashOnboardingToken } from './db'

export type Discovery2Record = Discovery2Answers & {
  id: string
  clientId: string
  tokenHash: string
  status: OnboardingStatus
  currentStep: number
  createdAt: Date
  updatedAt: Date
  lastActivityAt: Date
  submittedAt: Date | null
  clientLabel?: string
}

const discoveryReturning = `
  id,
  client_id as "clientId",
  token_hash as "tokenHash",
  status,
  current_step as "currentStep",
  order_process,
  primary_products_and_prices,
  personalization_options,
  customer_appreciation,
  must_show_on_website,
  created_at as "createdAt",
  updated_at as "updatedAt",
  last_activity_at as "lastActivityAt",
  submitted_at as "submittedAt"
`

const discoverySelect = `
  form.id,
  form.client_id as "clientId",
  form.token_hash as "tokenHash",
  form.status,
  form.current_step as "currentStep",
  form.order_process,
  form.primary_products_and_prices,
  form.personalization_options,
  form.customer_appreciation,
  form.must_show_on_website,
  form.created_at as "createdAt",
  form.updated_at as "updatedAt",
  form.last_activity_at as "lastActivityAt",
  form.submitted_at as "submittedAt",
  client.display_name as "clientLabel"
`

export async function findDiscovery2ByToken(token: string): Promise<Discovery2Record | null> {
  const sql = getDatabase()
  const rows = await sql<Discovery2Record[]>`
    select ${sql.unsafe(discoverySelect)}
    from discovery_2_forms as form
    join clients as client on client.id = form.client_id
    where form.token_hash = ${hashOnboardingToken(token)}
    limit 1
  `
  return rows[0] ?? null
}

export async function findDiscovery2ByClientId(clientId: string): Promise<Discovery2Record | null> {
  const sql = getDatabase()
  const rows = await sql<Discovery2Record[]>`
    select ${sql.unsafe(discoverySelect)}
    from discovery_2_forms as form
    join clients as client on client.id = form.client_id
    where form.client_id = ${clientId}
    limit 1
  `
  return rows[0] ?? null
}

export async function createOrRotateDiscovery2(clientId: string) {
  const sql = getDatabase()
  const token = randomBytes(32).toString('base64url')
  const tokenHash = hashOnboardingToken(token)
  const rows = await sql<Discovery2Record[]>`
    insert into discovery_2_forms (client_id, token_hash)
    values (${clientId}, ${tokenHash})
    on conflict (client_id) do update
      set token_hash = excluded.token_hash, updated_at = now()
    returning ${sql.unsafe(discoveryReturning)}
  `
  const form = rows[0]
  if (!form) throw new Error('Could not create Discovery 2 form')
  return { form, token }
}

export async function saveDiscovery2(
  formId: string,
  answers: Discovery2Answers,
  currentStep: number,
  reopen = false,
) {
  const sql = getDatabase()
  await sql.begin(async (transaction) => {
    const rows = await transaction<{ clientId: string }[]>`
      update discovery_2_forms
      set
        order_process = ${answers.order_process},
        primary_products_and_prices = ${answers.primary_products_and_prices},
        personalization_options = ${answers.personalization_options},
        customer_appreciation = ${answers.customer_appreciation},
        must_show_on_website = ${answers.must_show_on_website},
        current_step = ${currentStep},
        status = case
          when ${reopen} then 'in_progress'
          when status = 'not_started' then 'in_progress'
          else status
        end,
        submitted_at = case when ${reopen} then null else submitted_at end,
        updated_at = now(),
        last_activity_at = now()
      where id = ${formId}
      returning client_id as "clientId"
    `
    if (rows[0]) await transaction`update clients set updated_at = now() where id = ${rows[0].clientId}`
  })
}

export async function submitDiscovery2(formId: string, answers: Discovery2Answers) {
  const sql = getDatabase()
  await sql.begin(async (transaction) => {
    const rows = await transaction<{ clientId: string }[]>`
      update discovery_2_forms
      set
        order_process = ${answers.order_process},
        primary_products_and_prices = ${answers.primary_products_and_prices},
        personalization_options = ${answers.personalization_options},
        customer_appreciation = ${answers.customer_appreciation},
        must_show_on_website = ${answers.must_show_on_website},
        current_step = 5,
        status = 'submitted',
        submitted_at = coalesce(submitted_at, now()),
        updated_at = now(),
        last_activity_at = now()
      where id = ${formId}
      returning client_id as "clientId"
    `
    if (rows[0]) await transaction`update clients set updated_at = now() where id = ${rows[0].clientId}`
  })
}
