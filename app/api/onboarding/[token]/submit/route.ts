import { checkRateLimit, findOnboardingByToken, submitOnboarding } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { sanitizeAnswers, validateContact } from '@/lib/onboarding/validation'

export const runtime = 'nodejs'

type Context = { params: Promise<{ token: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })

    const project = await findOnboardingByToken(token)
    if (!project) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })

    const allowed = await checkRateLimit({
      action: 'submit',
      identity: `${project.tokenHash}:${getClientIp(request)}`,
      limit: 10,
    })
    if (!allowed) {
      return privateJson({ error: 'Príliš veľa pokusov. Skúste to o chvíľu.' }, { status: 429 })
    }

    let payload: unknown
    try {
      payload = await readSmallJson(request)
    } catch {
      return privateJson({ error: 'Neplatná požiadavka.' }, { status: 400 })
    }

    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const answers = sanitizeAnswers(body.answers)
    const errors = validateContact(answers)
    if (Object.keys(errors).length) {
      return privateJson({ error: 'Doplňte prosím kontaktné údaje.', fields: errors }, { status: 422 })
    }

    await submitOnboarding(project.id, answers)
    return privateJson({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
