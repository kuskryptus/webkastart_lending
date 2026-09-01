import 'server-only'

import { getDatabase } from './db'
import { sanitizeAnswers } from './validation'

/**
 * Stable, server-only input boundary for a future brief/content/design pipeline.
 * No AI provider is coupled to onboarding storage or route handlers.
 */
export async function getWebsiteGenerationInput(projectId: string) {
  const sql = getDatabase()
  const projects = await sql<{ clientLabel: string; answers: unknown }[]>`
    select client_label as "clientLabel", answers
    from onboarding_projects
    where id = ${projectId}
    limit 1
  `
  const project = projects[0]
  if (!project) return null

  const answers = sanitizeAnswers(project.answers)
  const assets = await sql<{
    id: string
    mimeType: string
    name: string
    objectKey: string
    size: number
  }[]>`
    select
      id,
      original_filename as name,
      mime_type as "mimeType",
      size::int as size,
      storage_key as "objectKey"
    from onboarding_assets
    where project_id = ${projectId} and status = 'uploaded'
    order by created_at asc
  `

  return {
    client: answers.client,
    business: answers.business,
    targetAudience: answers.targetAudience,
    websiteGoal: answers.websiteGoal,
    desiredActions: answers.desiredActions,
    services: answers.services,
    sections: answers.sections,
    futureFeatures: answers.futureFeatures,
    designPreferences: answers.designPreferences,
    designOther: answers.designOther,
    inspirationUrls: answers.inspirationUrls,
    existingWebsite: answers.existingWebsite,
    socialLinks: answers.socialLinks,
    assets,
    contact: answers.contact,
    billing: answers.billing,
    additionalNotes: answers.additionalNotes,
    source: {
      clientLabel: project.clientLabel,
      onboardingProjectId: projectId,
    },
  }
}
