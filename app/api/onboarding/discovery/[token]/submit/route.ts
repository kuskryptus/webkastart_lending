import { checkRateLimit } from '@/lib/onboarding/db'
import { findDiscovery2ByToken, submitDiscovery2 } from '@/lib/onboarding/discovery'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { sanitizeDiscovery2Answers } from '@/lib/onboarding/validation'

export const runtime = 'nodejs'

type Context = { params: Promise<{ token: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })

    const form = await findDiscovery2ByToken(token)
    if (!form) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })

    const allowed = await checkRateLimit({
      action: 'discovery-2-submit',
      identity: `${form.tokenHash}:${getClientIp(request)}`,
      limit: 10,
    })
    if (!allowed) return privateJson({ error: 'Príliš veľa pokusov. Skúste to o chvíľu.' }, { status: 429 })

    let payload: unknown
    try {
      payload = await readSmallJson(request)
    } catch {
      return privateJson({ error: 'Neplatná požiadavka.' }, { status: 400 })
    }

    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    await submitDiscovery2(form.id, sanitizeDiscovery2Answers(body.answers))
    return privateJson({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
