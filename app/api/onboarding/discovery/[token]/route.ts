import { checkRateLimit, pruneRateLimits } from '@/lib/onboarding/db'
import { findDiscovery2ByToken, saveDiscovery2 } from '@/lib/onboarding/discovery'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { sanitizeDiscovery2Answers } from '@/lib/onboarding/validation'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ token: string }> }

async function getForm(request: Request, token: string, action: string, limit: number) {
  if (!isValidToken(token)) return { response: privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 }) }

  const form = await findDiscovery2ByToken(token)
  if (!form) return { response: privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 }) }

  const allowed = await checkRateLimit({
    action,
    identity: `${form.tokenHash}:${getClientIp(request)}`,
    limit,
  })
  void pruneRateLimits()
  if (!allowed) {
    return { response: privateJson({ error: 'Príliš veľa požiadaviek. Skúste to o chvíľu.' }, { status: 429 }) }
  }

  return { form }
}

export async function GET(request: Request, { params }: Context) {
  try {
    const { token } = await params
    const result = await getForm(request, token, 'discovery-2-read', 120)
    if ('response' in result) return result.response
    const permission = await getWorkspaceSection(result.form.clientId, 'discovery_2')
    if (!permission?.clientVisible) return privateJson({ error: 'Tento formulár nie je dostupný.' }, { status: 404 })

    return privateJson({
      answers: sanitizeDiscovery2Answers(result.form),
      clientLabel: result.form.clientLabel || '',
      currentStep: result.form.currentStep,
      revision: result.form.revision,
      status: result.form.status,
      updatedAt: result.form.updatedAt.toISOString(),
    })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { token } = await params
    const result = await getForm(request, token, 'discovery-2-save', 60)
    if ('response' in result) return result.response
    const permission = await getWorkspaceSection(result.form.clientId, 'discovery_2')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Tento formulár nie je možné upravovať.' }, { status: 403 })
    }

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
    const currentStep = Math.min(5, Math.max(1, Math.round(Number(body.currentStep) || 1)))
    const answers = sanitizeDiscovery2Answers(body.answers)
    const reopen = body.reopen === true && result.form.status === 'submitted'
    const revision = Number(body.revision)
    if (!Number.isSafeInteger(revision) || revision < 1) {
      return privateJson({ error: 'Obnovte stránku a skúste zmenu znova.' }, { status: 422 })
    }
    const saved = await saveDiscovery2(result.form.id, answers, currentStep, reopen, revision)
    if (!saved) return privateJson({ error: 'Údaje sa medzitým zmenili. Obnovte stránku.', reason: 'conflict' }, { status: 409 })

    return privateJson({ ok: true, reopened: reopen, revision: saved.revision, savedAt: new Date().toISOString() })
  } catch (error) {
    return apiError(error)
  }
}
