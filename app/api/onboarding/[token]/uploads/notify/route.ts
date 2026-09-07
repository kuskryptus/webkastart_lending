import { checkRateLimit, findOnboardingByToken } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { sendUploadNotification } from '@/lib/onboarding/upload-notification'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
type Context = { params: Promise<{ token: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const project = await findOnboardingByToken(token)
    if (!project) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const permission = await getWorkspaceSection(project.clientId, 'files')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Nahrávanie súborov nie je povolené.' }, { status: 403 })
    }
    const allowed = await checkRateLimit({
      action: 'upload-notify',
      identity: `${project.tokenHash}:${getClientIp(request)}`,
      limit: 30,
    })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })
    const payload = await readSmallJson(request, 10_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const result = await sendUploadNotification({
      assetIds: body.assetIds,
      clientId: project.clientId,
      requestOrigin: new URL(request.url).origin,
    })
    return 'error' in result
      ? privateJson({ error: result.error }, { status: result.status })
      : privateJson(result)
  } catch (error) {
    return apiError(error)
  }
}
