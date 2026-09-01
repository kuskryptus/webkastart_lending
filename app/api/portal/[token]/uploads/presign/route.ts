import { findCoreOnboardingByClientId } from '@/lib/onboarding/db'
import { createPendingAsset } from '@/lib/onboarding/assets'
import { apiError, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { authorizePortalRequest } from '@/lib/onboarding/portal-auth'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
type Context = { params: Promise<{ token: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token } = await params
    const auth = await authorizePortalRequest(request, token, 'portal-upload', 120)
    if ('response' in auth) return auth.response
    const permission = await getWorkspaceSection(auth.client.id, 'files')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Nahrávanie súborov nie je povolené.' }, { status: 403 })
    }
    const project = await findCoreOnboardingByClientId(auth.client.id)
    if (!project) return privateJson({ error: 'Projekt sa nenašiel.' }, { status: 404 })
    const payload = await readSmallJson(request, 10_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const result = await createPendingAsset({
      actor: 'client', body, clientId: auth.client.id, clientVisible: true, projectId: project.id,
    })
    return 'error' in result
      ? privateJson({ error: result.error }, { status: 422 })
      : privateJson({ ...result, expiresIn: 600 })
  } catch (error) {
    return apiError(error)
  }
}
