import { createPendingAsset } from '@/lib/onboarding/assets'
import { checkRateLimit, findOnboardingByToken } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
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
      action: 'upload',
      identity: `${project.tokenHash}:${getClientIp(request)}`,
      limit: 120,
    })
    if (!allowed) return privateJson({ error: 'Príliš veľa uploadov. Skúste to o chvíľu.' }, { status: 429 })

    let payload: unknown
    try {
      payload = await readSmallJson(request, 10_000)
    } catch {
      return privateJson({ error: 'Neplatná požiadavka.' }, { status: 400 })
    }
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const result = await createPendingAsset({
      actor: 'client',
      assetCategory: 'source',
      body,
      clientId: project.clientId,
      clientVisible: true,
      projectId: project.id,
    })
    return 'error' in result
      ? privateJson({ error: result.error }, { status: 422 })
      : privateJson({ ...result, expiresIn: 600 })
  } catch (error) {
    return apiError(error)
  }
}
