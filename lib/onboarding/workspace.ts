import 'server-only'

import postgres from 'postgres'
import { getDatabase, hashOnboardingToken } from './db'
import { findCoreOnboardingByClientId, listAssets } from './db'
import { findDiscovery2ByClientId } from './discovery'
import type {
  ClientWorkspaceResponse,
  Discovery2Answers,
  OnboardingAnswers,
  OnboardingStatus,
  WorkspaceProgress,
  WorkspaceSection,
  WorkspaceSectionKey,
} from './types'
import { workspaceSectionKeys } from './types'
import { sanitizeAnswers } from './validation'
import { clientIdFromPermanentPortalToken } from './portal-token'

type ClientRecord = {
  id: string
  displayName: string
  portalTokenHash: string
}

type SectionRecord = {
  key: WorkspaceSectionKey
  clientVisible: boolean
  clientEditable: boolean
  content: string
  updatedAt: Date
}

export class WorkspaceConflictError extends Error {
  constructor() {
    super('WORKSPACE_CONFLICT')
  }
}

function hasValue(value: string | string[]) {
  return Array.isArray(value) ? value.some(Boolean) : Boolean(value.trim())
}

export function coreProgress(answers: OnboardingAnswers): WorkspaceProgress {
  const values: Array<string | string[]> = [
    answers.client.displayName,
    answers.business.area,
    answers.business.description,
    answers.projectType,
    answers.targetAudienceSelections,
    answers.targetAudience,
    answers.websiteExpectations,
    answers.websiteInformation,
    answers.websiteGoal,
    answers.desiredActions,
    answers.offeringTypes,
    answers.offerItems,
    answers.services,
    answers.sections,
    answers.otherSections,
    answers.futureFeatures,
    answers.designPreferences,
    answers.designOther,
    answers.colorPreferences,
    answers.designDislikes,
    answers.inspirationUrls,
    answers.dislikes,
    answers.existingWebsite,
    answers.socialLinks,
    answers.contact.name,
    answers.contact.email,
    answers.contact.phone,
    answers.contact.preferredMethods,
    answers.contact.preferredMethod,
    answers.billing.companyName,
    answers.billing.companyId,
    answers.billing.taxId,
    answers.billing.vatId,
    answers.billing.address,
    answers.additionalNotes,
  ]
  const completedItems = values.filter(hasValue).length
  return {
    completed: completedItems === values.length,
    completedItems,
    percentage: Math.round((completedItems / values.length) * 100),
    totalItems: values.length,
  }
}

export function discoveryProgress(answers: Discovery2Answers): WorkspaceProgress {
  const values = [
    answers.order_methods.length > 0 || Boolean(answers.order_process.trim()),
    answers.products_and_prices.length > 0 || Boolean(answers.primary_products_and_prices.trim()),
    answers.personalization_choices.length > 0 || Boolean(answers.personalization_options.trim()),
    answers.customer_appreciation_choices.length > 0 || Boolean(answers.customer_appreciation.trim()),
    answers.frequent_questions.length > 0 || Boolean(answers.frequent_questions_other.trim()),
    answers.must_show_choices.length > 0 || Boolean(answers.must_show_on_website.trim()),
  ]
  const completedItems = values.filter(Boolean).length
  return {
    completed: completedItems === values.length,
    completedItems,
    percentage: Math.round((completedItems / values.length) * 100),
    totalItems: values.length,
  }
}

export function progressForStatus(progress: WorkspaceProgress, status: OnboardingStatus) {
  return status === 'submitted'
    ? { ...progress, completed: true, percentage: 100 }
    : progress
}

export async function findClientByPortalToken(token: string): Promise<ClientRecord | null> {
  const sql = getDatabase()
  const tokenHash = hashOnboardingToken(token)
  const permanentClientId = clientIdFromPermanentPortalToken(token)
  if (permanentClientId) {
    const rows = await sql<ClientRecord[]>`
      select id, display_name as "displayName", ${tokenHash}::text as "portalTokenHash"
      from clients where id = ${permanentClientId} limit 1
    `
    if (rows[0]) return rows[0]
  }
  const savedLinks = await sql<ClientRecord[]>`
    select client.id, client.display_name as "displayName", ${tokenHash}::text as "portalTokenHash"
    from client_portal_links as link
    join clients as client on client.id = link.client_id
    where link.token_hash = ${tokenHash}
    limit 1
  `
  if (savedLinks[0]) return savedLinks[0]
  const legacy = await sql<ClientRecord[]>`
    select id, display_name as "displayName", portal_token_hash as "portalTokenHash"
    from clients where portal_token_hash = ${tokenHash} limit 1
  `
  return legacy[0] ?? null
}

export async function listWorkspaceSections(clientId: string): Promise<SectionRecord[]> {
  const sql = getDatabase()
  return sql<SectionRecord[]>`
    select
      section_key as key,
      client_visible as "clientVisible",
      client_editable as "clientEditable",
      content,
      updated_at as "updatedAt"
    from client_workspace_sections
    where client_id = ${clientId}
    order by array_position(
      array['core', 'discovery_2', 'files', 'creative_strategy', 'creative_directions', 'internal_notes'],
      section_key
    )
  `
}

export async function getWorkspaceSection(clientId: string, key: WorkspaceSectionKey) {
  const sections = await listWorkspaceSections(clientId)
  return sections.find((section) => section.key === key) ?? null
}

export async function getClientWorkspace(
  clientId: string,
  options: { visibleOnly?: boolean } = {},
): Promise<ClientWorkspaceResponse | null> {
  const sql = getDatabase()
  const clients = await sql<{ displayName: string }[]>`
    select display_name as "displayName" from clients where id = ${clientId} limit 1
  `
  const client = clients[0]
  if (!client) return null

  const [core, discovery2, allAssets, sectionRecords] = await Promise.all([
    findCoreOnboardingByClientId(clientId),
    findDiscovery2ByClientId(clientId),
    listAssets(clientId),
    listWorkspaceSections(clientId),
  ])
  const sections = sectionRecords
    .filter((section) => !options.visibleOnly || section.clientVisible)
    .map<WorkspaceSection>((section) => ({
      ...section,
      content: options.visibleOnly && section.key === 'internal_notes' ? '' : section.content,
      updatedAt: section.updatedAt.toISOString(),
    }))
  const visibleKeys = new Set(sections.map((section) => section.key))
  const assets = allAssets
    .filter((asset) => asset.status === 'uploaded')
    .filter((asset) => !options.visibleOnly || asset.clientVisible)
    .map((asset) => ({ ...asset, createdAt: new Date(asset.createdAt).toISOString() }))
  const safeCoreAnswers = core ? sanitizeAnswers(core.answers) : null
  const coreValue = core && safeCoreAnswers && (!options.visibleOnly || visibleKeys.has('core')) ? {
    answers: safeCoreAnswers,
    currentStep: core.currentStep,
    progress: progressForStatus(coreProgress(safeCoreAnswers), core.status),
    revision: core.revision,
    status: core.status,
    updatedAt: core.updatedAt.toISOString(),
  } : null
  const discoveryAnswers = discovery2 && {
    order_methods: discovery2.order_methods,
    order_methods_other: discovery2.order_methods_other,
    order_process: discovery2.order_process,
    products_and_prices: discovery2.products_and_prices,
    primary_products_and_prices: discovery2.primary_products_and_prices,
    personalization_choices: discovery2.personalization_choices,
    personalization_options: discovery2.personalization_options,
    customer_appreciation_choices: discovery2.customer_appreciation_choices,
    customer_appreciation: discovery2.customer_appreciation,
    customer_quote: discovery2.customer_quote,
    frequent_questions: discovery2.frequent_questions,
    frequent_questions_other: discovery2.frequent_questions_other,
    must_show_choices: discovery2.must_show_choices,
    must_show_on_website: discovery2.must_show_on_website,
  }
  const discoveryValue = discovery2 && discoveryAnswers && (!options.visibleOnly || visibleKeys.has('discovery_2')) ? {
    answers: discoveryAnswers,
    currentStep: discovery2.currentStep,
    progress: progressForStatus(discoveryProgress(discoveryAnswers), discovery2.status),
    revision: discovery2.revision,
    status: discovery2.status,
    updatedAt: discovery2.updatedAt.toISOString(),
  } : null

  const progressValues = sections.flatMap((section) => {
    if (section.key === 'core' && coreValue) return [coreValue.progress.percentage]
    if (section.key === 'discovery_2' && discoveryValue) return [discoveryValue.progress.percentage]
    if (section.key === 'files') return [assets.length ? 100 : 0]
    if (section.key === 'creative_strategy' || section.key === 'creative_directions') {
      return [section.content.trim() ? 100 : 0]
    }
    return []
  })

  return {
    assets,
    clientLabel: client.displayName,
    core: coreValue,
    discovery2: discoveryValue,
    overallProgress: progressValues.length
      ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
      : 0,
    sections,
  }
}

export async function saveCoreVersioned(options: {
  answers: OnboardingAnswers
  clientId: string
  currentStep: number
  revision: number
}) {
  const sql = getDatabase()
  const rows = await sql.begin(async (transaction) => {
    const updated = await transaction<{ revision: number; status: OnboardingStatus; updatedAt: Date }[]>`
      update onboarding_projects
      set
        answers = ${transaction.json(options.answers as unknown as postgres.JSONValue)},
        current_step = ${options.currentStep},
        status = case when status = 'not_started' then 'in_progress' else status end,
        revision = revision + 1,
        updated_at = now(),
        last_activity_at = now()
      where client_id = ${options.clientId} and revision = ${options.revision}
      returning revision::int as revision, status, updated_at as "updatedAt"
    `
    if (updated[0]) await transaction`update clients set updated_at = now() where id = ${options.clientId}`
    return updated
  }) as { revision: number; status: OnboardingStatus; updatedAt: Date }[]
  if (!rows[0]) throw new WorkspaceConflictError()
  return rows[0]
}

export async function saveDiscoveryVersioned(options: {
  answers: Discovery2Answers
  clientId: string
  currentStep: number
  revision: number
}) {
  const sql = getDatabase()
  const rows = await sql.begin(async (transaction) => {
    const updated = await transaction<{ revision: number; status: OnboardingStatus; updatedAt: Date }[]>`
      update discovery_2_forms
      set
        order_methods = ${transaction.json(options.answers.order_methods as unknown as postgres.JSONValue)},
        order_methods_other = ${options.answers.order_methods_other},
        order_process = ${options.answers.order_process},
        products_and_prices = ${transaction.json(options.answers.products_and_prices as unknown as postgres.JSONValue)},
        primary_products_and_prices = ${options.answers.primary_products_and_prices},
        personalization_choices = ${transaction.json(options.answers.personalization_choices as unknown as postgres.JSONValue)},
        personalization_options = ${options.answers.personalization_options},
        customer_appreciation_choices = ${transaction.json(options.answers.customer_appreciation_choices as unknown as postgres.JSONValue)},
        customer_appreciation = ${options.answers.customer_appreciation},
        customer_quote = ${options.answers.customer_quote},
        frequent_questions = ${transaction.json(options.answers.frequent_questions as unknown as postgres.JSONValue)},
        frequent_questions_other = ${options.answers.frequent_questions_other},
        must_show_choices = ${transaction.json(options.answers.must_show_choices as unknown as postgres.JSONValue)},
        must_show_on_website = ${options.answers.must_show_on_website},
        current_step = ${options.currentStep},
        status = case when status = 'not_started' then 'in_progress' else status end,
        revision = revision + 1,
        updated_at = now(),
        last_activity_at = now()
      where client_id = ${options.clientId} and revision = ${options.revision}
      returning revision::int as revision, status, updated_at as "updatedAt"
    `
    if (updated[0]) await transaction`update clients set updated_at = now() where id = ${options.clientId}`
    return updated
  }) as { revision: number; status: OnboardingStatus; updatedAt: Date }[]
  if (!rows[0]) throw new WorkspaceConflictError()
  return rows[0]
}

export async function updateWorkspaceSection(options: {
  clientEditable: boolean
  clientId: string
  clientVisible: boolean
  content: string
  key: WorkspaceSectionKey
}) {
  const sql = getDatabase()
  const clientVisible = options.key === 'internal_notes' ? false : options.clientVisible
  const clientEditable = clientVisible && options.clientEditable
  await sql.begin(async (transaction) => {
    await transaction`
      update client_workspace_sections
      set
        client_visible = ${clientVisible},
        client_editable = ${clientEditable},
        content = ${options.content.slice(0, 50_000)},
        updated_at = now()
      where client_id = ${options.clientId} and section_key = ${options.key}
    `
    await transaction`update clients set updated_at = now() where id = ${options.clientId}`
  })
}

export function isWorkspaceSectionKey(value: unknown): value is WorkspaceSectionKey {
  return typeof value === 'string' && workspaceSectionKeys.includes(value as WorkspaceSectionKey)
}
