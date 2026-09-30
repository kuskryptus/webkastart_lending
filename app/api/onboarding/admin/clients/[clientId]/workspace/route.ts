import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { apiError, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { sanitizeAnswers, sanitizeDiscovery2Answers } from '@/lib/onboarding/validation'
import { isPrefillFieldKey, markPrefilledFields } from '@/lib/onboarding/prefill'
import { isImplementationFieldKey } from '@/lib/onboarding/implementation-brief'
import {
  coreProgress,
  discoveryProgress,
  getClientOnboardingType,
  getClientWorkspace,
  isWorkspaceSectionKey,
  progressForStatus,
  saveCoreVersioned,
  saveDiscoveryVersioned,
  savePageStructureVersioned,
  updateAssetsLocalPath,
  updateImplementationFieldSelection,
  updateWorkspaceSection,
  WorkspaceConflictError,
} from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ clientId: string }> }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function unauthorized() {
  return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })
}

export async function GET(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return unauthorized()
  try {
    const { clientId } = await params
    if (!UUID_PATTERN.test(clientId)) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
    const workspace = await getClientWorkspace(clientId)
    return workspace
      ? privateJson(workspace)
      : privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}

export async function PATCH(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return unauthorized()
  try {
    const { clientId } = await params
    if (!UUID_PATTERN.test(clientId)) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
    const payload = await readSmallJson(request)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}

    if (body.operation === 'assets_local_path') {
      const assetsLocalPath = await updateAssetsLocalPath({
        assetsLocalPath: body.assetsLocalPath,
        clientId,
      })
      return privateJson({ assetsLocalPath })
    }

    if (body.operation === 'implementation_selection') {
      if (!isImplementationFieldKey(body.fieldKey)) {
        return privateJson({ error: 'Neplatné pole implementačného zadania.' }, { status: 422 })
      }
      await updateImplementationFieldSelection({
        clientId,
        fieldKey: body.fieldKey,
        included: body.included === true,
      })
      return privateJson({ ok: true })
    }

    const sectionKey = body.sectionKey
    if (!isWorkspaceSectionKey(sectionKey)) return privateJson({ error: 'Neplatná sekcia.' }, { status: 422 })

    if (body.operation === 'settings') {
      await updateWorkspaceSection({
        clientEditable: body.clientEditable === true,
        clientId,
        clientVisible: body.clientVisible === true,
        content: typeof body.content === 'string' ? body.content : '',
        key: sectionKey,
      })
      return privateJson({ ok: true })
    }

    const revision = Number(body.revision)
    if (!Number.isSafeInteger(revision) || revision < 1) {
      return privateJson({ error: 'Chýba verzia údajov. Obnovte stránku.' }, { status: 422 })
    }
    if (sectionKey === 'page_structure') {
      const saved = await savePageStructureVersioned({
        clientId,
        revision,
        structure: body.structure,
      })
      return privateJson({
        revision: saved.revision,
        savedAt: saved.updatedAt.toISOString(),
        structure: saved.structure,
      })
    }
    if (sectionKey === 'core') {
      const onboardingType = await getClientOnboardingType(clientId)
      if (!onboardingType) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
      let answers = sanitizeAnswers(body.answers)
      if (body.operation === 'prefill') {
        const fields = Array.isArray(body.prefillFields)
          ? body.prefillFields.filter(isPrefillFieldKey)
          : []
        answers = markPrefilledFields(answers, fields)
      }
      const saved = await saveCoreVersioned({
        answers,
        clientId,
        currentStep: Math.min(6, Math.max(1, Math.round(Number(body.currentStep) || 1))),
        revision,
      })
      return privateJson({ answers, progress: progressForStatus(coreProgress(answers, onboardingType), saved.status), revision: saved.revision, savedAt: saved.updatedAt.toISOString() })
    }
    if (sectionKey === 'discovery_2') {
      const answers = sanitizeDiscovery2Answers(body.answers)
      const saved = await saveDiscoveryVersioned({
        answers,
        clientId,
        currentStep: Math.min(6, Math.max(1, Math.round(Number(body.currentStep) || 1))),
        revision,
      })
      return privateJson({ progress: progressForStatus(discoveryProgress(answers), saved.status), revision: saved.revision, savedAt: saved.updatedAt.toISOString() })
    }
    return privateJson({ error: 'Táto sekcia neobsahuje formulár.' }, { status: 422 })
  } catch (error) {
    if (error instanceof WorkspaceConflictError) {
      return privateJson({
        error: 'Klient alebo iný administrátor medzitým údaje zmenil. Obnovte sekciu.',
        reason: 'conflict',
      }, { status: 409 })
    }
    return apiError(error, { exposeDetails: true })
  }
}
