import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  isAdminConfigured,
  isValidAdminSecret,
} from '@/lib/onboarding/admin-auth'
import { checkRateLimit } from '@/lib/onboarding/db'
import { apiError, getClientIp, privateJson, readSmallJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let validAdminSecret = false

  if (!isAdminConfigured()) {
    return privateJson({ error: 'Interný prístup ešte nie je nakonfigurovaný.' }, { status: 503 })
  }

  try {
    const payload = await readSmallJson(request, 2_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    validAdminSecret = isValidAdminSecret(body.secret)

    const allowed = await checkRateLimit({
      action: 'admin-login',
      identity: getClientIp(request),
      limit: 10,
    })
    if (!allowed) {
      return privateJson({ error: 'Príliš veľa pokusov. Skúste to o chvíľu.' }, { status: 429 })
    }

    if (!validAdminSecret) {
      return privateJson({ error: 'Nesprávne heslo.' }, { status: 401 })
    }

    const response = privateJson({ ok: true })
    response.headers.append('Set-Cookie', createAdminSessionCookie())
    return response
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE')) {
      return privateJson({ error: 'Neplatná požiadavka.' }, { status: 400 })
    }
    return apiError(error, { exposeDetails: validAdminSecret })
  }
}

export async function DELETE() {
  const response = privateJson({ ok: true })
  response.headers.append('Set-Cookie', clearAdminSessionCookie())
  return response
}
