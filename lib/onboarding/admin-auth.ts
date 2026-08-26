import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE_NAME = 'webkastart_onboarding_admin'
const COOKIE_PAYLOAD = 'webkastart-onboarding-admin-v1'

export function isAdminConfigured() {
  return Boolean(process.env.ONBOARDING_ADMIN_SECRET && process.env.ONBOARDING_ADMIN_SECRET.length >= 16)
}

function sessionValue() {
  const secret = process.env.ONBOARDING_ADMIN_SECRET
  if (!secret || secret.length < 16) return ''
  return createHmac('sha256', secret).update(COOKIE_PAYLOAD).digest('base64url')
}

export function isValidAdminSecret(candidate: unknown) {
  const secret = process.env.ONBOARDING_ADMIN_SECRET
  if (!secret || secret.length < 16 || typeof candidate !== 'string') return false

  const expected = createHmac('sha256', secret).update('admin-secret-check').digest()
  const received = createHmac('sha256', candidate).update('admin-secret-check').digest()
  return timingSafeEqual(expected, received)
}

export function isAdminCookie(value: string | undefined) {
  if (!value) return false
  const expected = Buffer.from(sessionValue())
  const received = Buffer.from(value)
  return expected.length > 0 && expected.length === received.length && timingSafeEqual(expected, received)
}

export function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`))
  if (!cookie) return false

  try {
    return isAdminCookie(decodeURIComponent(cookie.slice(ADMIN_COOKIE_NAME.length + 1)))
  } catch {
    return false
  }
}

export function createAdminSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(sessionValue())}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${secure}`
}

export function clearAdminSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`
}
