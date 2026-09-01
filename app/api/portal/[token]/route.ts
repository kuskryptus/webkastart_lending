import { authorizePortalRequest } from '@/lib/onboarding/portal-auth'
import { findCoreOnboardingByClientId } from '@/lib/onboarding/db'
import { apiError, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { reconcileClientMetadata } from '@/lib/onboarding/prefill'
import { sanitizeAnswers, sanitizeDiscovery2Answers } from '@/lib/onboarding/validation'
import {
  coreProgress,
  discoveryProgress,
  getClientWorkspace,
  getWorkspaceSection,
  progressForStatus,
  saveCoreVersioned,
  saveDiscoveryVersioned,
  WorkspaceConflictError,
} from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ token: string }> }

export async function GET(request: Request, { params }: Context) {
  try {
    const { token } = await params
    const result = await authorizePortalRequest(request, token, 'portal-read')
    if ('response' in result) return result.response
    const workspace = await getClientWorkspace(result.client.id, { visibleOnly: true })
    if (!workspace) return privateJson({ error: 'Projekt sa nenašiel.' }, { status: 404 })
    return privateJson(workspace)
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { token } = await params
    const result = await authorizePortalRequest(request, token, 'portal-save', 60)
    if ('response' in result) return result.response
    let payload: unknown
    try {
      payload = await readSmallJson(request)
    } catch (error) {
      const tooLarge = error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE'
      return privateJson({ error: tooLarge ? 'Odpovede sú príliš dlhé.' : 'Neplatná požiadavka.' }, { status: tooLarge ? 413 : 400 })
    }
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const sectionKey = body.sectionKey
    if (sectionKey !== 'core' && sectionKey !== 'discovery_2') {
      return privateJson({ error: 'Túto sekciu nie je možné upraviť.' }, { status: 422 })
    }
    const permission = await getWorkspaceSection(result.client.id, sectionKey)
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Túto sekciu nemôžete upravovať.' }, { status: 403 })
    }
    const revision = Number(body.revision)
    if (!Number.isSafeInteger(revision) || revision < 1) {
      return privateJson({ error: 'Chýba verzia uložených údajov. Obnovte stránku.' }, { status: 422 })
    }

    if (sectionKey === 'core') {
      const current = await findCoreOnboardingByClientId(result.client.id)
      if (!current) return privateJson({ error: 'Projekt sa nenašiel.' }, { status: 404 })
      const answers = reconcileClientMetadata(
        sanitizeAnswers(current.answers),
        sanitizeAnswers(body.answers),
      )
      const saved = await saveCoreVersioned({
        answers,
        clientId: result.client.id,
        currentStep: Math.min(6, Math.max(1, Math.round(Number(body.currentStep) || 1))),
        revision,
      })
      return privateJson({
        progress: progressForStatus(coreProgress(answers), saved.status),
        revision: saved.revision,
        savedAt: saved.updatedAt.toISOString(),
      })
    }

    const answers = sanitizeDiscovery2Answers(body.answers)
    const saved = await saveDiscoveryVersioned({
      answers,
      clientId: result.client.id,
      currentStep: Math.min(6, Math.max(1, Math.round(Number(body.currentStep) || 1))),
      revision,
    })
    return privateJson({
      progress: progressForStatus(discoveryProgress(answers), saved.status),
      revision: saved.revision,
      savedAt: saved.updatedAt.toISOString(),
    })
  } catch (error) {
    if (error instanceof WorkspaceConflictError) {
      return privateJson({
        error: 'Údaje sa medzitým zmenili. Obnovte sekciu, aby ste neprepísali novšiu verziu.',
        reason: 'conflict',
      }, { status: 409 })
    }
    return apiError(error)
  }
}
