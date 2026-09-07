import { createPartUrlsForPendingAsset } from '@/lib/onboarding/assets'
import { checkRateLimit, findOnboardingByToken } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
type Context = { params: Promise<{ token: string; uploadId: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token, uploadId } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const project = await findOnboardingByToken(token)
    if (!project) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const permission = await getWorkspaceSection(project.clientId, 'files')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Nahrávanie súborov nie je povolené.' }, { status: 403 })
    }
    const allowed = await checkRateLimit({
      action: 'upload-parts',
      identity: `${project.tokenHash}:${getClientIp(request)}`,
      limit: 180,
    })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })
    const payload = await readSmallJson(request, 5_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const result = await createPartUrlsForPendingAsset({
      actor: 'client',
      assetId: uploadId,
      clientId: project.clientId,
      partNumbers: body.partNumbers,
    })
    return 'error' in result
      ? privateJson({ error: result.error }, { status: result.status })
      : privateJson(result)
  } catch (error) {
    return apiError(error)
  }
}
