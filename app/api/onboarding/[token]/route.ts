import { checkRateLimit, findOnboardingByToken, listAssets, pruneRateLimits, saveOnboarding } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { sanitizeAnswers } from '@/lib/onboarding/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ token: string }> }

async function getProject(request: Request, token: string, action: string, limit: number) {
  if (!isValidToken(token)) return { response: privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 }) }

  const project = await findOnboardingByToken(token)
  if (!project) return { response: privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 }) }

  const allowed = await checkRateLimit({
    action,
    identity: `${project.tokenHash}:${getClientIp(request)}`,
    limit,
  })
  void pruneRateLimits()
  if (!allowed) {
    return { response: privateJson({ error: 'Príliš veľa požiadaviek. Skúste to o chvíľu.' }, { status: 429 }) }
  }

  return { project }
}

export async function GET(request: Request, { params }: Context) {
  try {
    const { token } = await params
    const result = await getProject(request, token, 'read', 120)
    if ('response' in result) return result.response

    const assets = await listAssets(result.project.id)
    return privateJson({
      answers: sanitizeAnswers(result.project.answers),
      assets,
      clientLabel: result.project.clientLabel,
      currentStep: result.project.currentStep,
      status: result.project.status,
      updatedAt: result.project.updatedAt.toISOString(),
    })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { token } = await params
    const result = await getProject(request, token, 'save', 60)
    if ('response' in result) return result.response

    let payload: unknown
    try {
      payload = await readSmallJson(request)
    } catch (error) {
      const tooLarge = error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE'
      return privateJson(
        { error: tooLarge ? 'Odpovede sú príliš dlhé.' : 'Neplatná požiadavka.' },
        { status: tooLarge ? 413 : 400 },
      )
    }

    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const currentStep = Math.min(6, Math.max(1, Math.round(Number(body.currentStep) || 1)))
    const answers = sanitizeAnswers(body.answers)
    await saveOnboarding(result.project.id, answers, currentStep)

    return privateJson({ ok: true, savedAt: new Date().toISOString() })
  } catch (error) {
    return apiError(error)
  }
}
