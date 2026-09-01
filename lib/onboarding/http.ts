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

function redactSecrets(value: string) {
  const secretNames = [
    'DATABASE_URL',
    'ONBOARDING_ADMIN_SECRET',
    'ONBOARDING_PORTAL_LINK_SECRET',
    'ONBOARDING_RATE_LIMIT_SECRET',
    'RESEND_API_KEY',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
  ]

  return secretNames.reduce((result, name) => {
    const secret = process.env[name]
    return secret && secret.length >= 8 ? result.replaceAll(secret, `[${name} skryté]`) : result
  }, value)
}

export function getErrorDetails(error: unknown) {
  if (!(error instanceof Error)) return redactSecrets(String(error)).slice(0, 2_000)

  const details = new Set<string>()
  const seen = new Set<unknown>()

  function collect(current: unknown, depth = 0) {
    if (depth > 3 || seen.has(current)) return
    seen.add(current)

    if (current instanceof Error) {
      details.add(`${current.name}: ${current.message}`)
      const record = current as Error & {
        cause?: unknown
        code?: unknown
        detail?: unknown
        errors?: unknown
        hint?: unknown
      }
      if (typeof record.code === 'string') details.add(`Kód: ${record.code}`)
      if (typeof record.detail === 'string') details.add(`Detail: ${record.detail}`)
      if (typeof record.hint === 'string') details.add(`Hint: ${record.hint}`)
      if (Array.isArray(record.errors)) record.errors.forEach((nested) => collect(nested, depth + 1))
      if (record.cause) collect(record.cause, depth + 1)
      return
    }

    if (typeof current === 'string') details.add(current)
  }

  collect(error)
  return redactSecrets([...details].join('\n')).slice(0, 2_000)
}

export function apiError(error: unknown, options: { exposeDetails?: boolean } = {}) {
  const errorRecord = error instanceof Error
    ? error as Error & { missingVariables?: unknown }
    : null
  const missingConfiguration = Array.isArray(errorRecord?.missingVariables)
    ? errorRecord.missingVariables.filter((value): value is string => typeof value === 'string')
    : errorRecord?.message.includes('DATABASE_URL')
      ? ['DATABASE_URL']
      : []

  if (missingConfiguration.length) {
    console.error(`[onboarding:configuration] Chýba: ${missingConfiguration.join(', ')}`)
  } else {
    console.error('[onboarding]', error)
  }
  const storageConfigurationError =
    error instanceof Error && error.name === 'StorageConfigurationError'
  const configurationError =
    error instanceof Error &&
    (error.message.includes('not configured') || error.message.includes('DATABASE_URL'))

  return privateJson(
    {
      error: storageConfigurationError
        ? 'Nahrávanie súborov momentálne nie je dostupné. Kontaktujte správcu projektu.'
        : configurationError
          ? 'Onboarding ešte nie je nakonfigurovaný.'
          : 'Niečo sa nepodarilo. Skúste to prosím znova.',
      details: options.exposeDetails ? getErrorDetails(error) : undefined,
      configuration: missingConfiguration.length ? { missing: missingConfiguration } : undefined,
      reason: storageConfigurationError
        ? 'storage_not_configured'
        : configurationError
          ? 'not_configured'
          : 'server_error',
    },
    { status: configurationError ? 503 : 500 },
  )
}
