import { createPendingAsset } from '@/lib/onboarding/assets'
import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { findCoreOnboardingByClientId } from '@/lib/onboarding/db'
import { apiError, privateJson, readSmallJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
type Context = { params: Promise<{ clientId: string }> }

export async function POST(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })
  try {
    const { clientId } = await params
    const project = await findCoreOnboardingByClientId(clientId)
    if (!project) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
    const payload = await readSmallJson(request, 10_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const result = await createPendingAsset({
      actor: 'admin', body, clientId, clientVisible: body.clientVisible === true, projectId: project.id,
    })
    return 'error' in result
      ? privateJson({ error: result.error }, { status: 422 })
      : privateJson({ ...result, expiresIn: 600 })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}
