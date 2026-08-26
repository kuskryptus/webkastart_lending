import { ONBOARDING_TOKEN_PATTERN } from './validation'

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

export function isValidToken(token: string) {
  return ONBOARDING_TOKEN_PATTERN.test(token)
}

export function privateJson(data: unknown, init?: ResponseInit) {
  const response = Response.json(data, init)
  response.headers.set('Cache-Control', 'no-store, private')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}

export async function readSmallJson(request: Request, maxBytes = 200_000) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > maxBytes) throw new Error('PAYLOAD_TOO_LARGE')

  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new Error('PAYLOAD_TOO_LARGE')
  }
  return JSON.parse(text) as unknown
}

export function apiError(error: unknown) {
  console.error('[onboarding]', error)
  const configurationError =
    error instanceof Error &&
    (error.message.includes('not configured') || error.message.includes('DATABASE_URL'))

  return privateJson(
    {
      error: configurationError
        ? 'Onboarding ešte nie je nakonfigurovaný.'
        : 'Niečo sa nepodarilo. Skúste to prosím znova.',
      reason: configurationError ? 'not_configured' : 'server_error',
    },
    { status: configurationError ? 503 : 500 },
  )
}
