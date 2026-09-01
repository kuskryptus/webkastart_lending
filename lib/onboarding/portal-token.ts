import 'server-only'

import { createDecipheriv, createHash, createHmac, timingSafeEqual } from 'node:crypto'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function portalSecret() {
  const secret = process.env.ONBOARDING_PORTAL_LINK_SECRET || process.env.ONBOARDING_ADMIN_SECRET
  return secret && secret.length >= 16 ? secret : null
}

function legacyEncryptionKey() {
  const secret = process.env.ONBOARDING_LINK_ENCRYPTION_SECRET || process.env.ONBOARDING_ADMIN_SECRET
  if (!secret || secret.length < 16) return null
  return createHash('sha256').update(`webkastart-portal-link-v1:${secret}`).digest()
}

function signature(encodedClientId: string, secret: string) {
  return createHmac('sha256', secret)
    .update(`webkastart-permanent-portal-v1:${encodedClientId}`)
    .digest('base64url')
}

export function createPermanentPortalToken(clientId: string) {
  const secret = portalSecret()
  if (!secret || !UUID_PATTERN.test(clientId)) return null
  const encodedClientId = Buffer.from(clientId, 'utf8').toString('base64url')
  return `${encodedClientId}.${signature(encodedClientId, secret)}`
}

export function clientIdFromPermanentPortalToken(token: string) {
  const secret = portalSecret()
  if (!secret) return null
  const [encodedClientId, receivedSignature, extra] = token.split('.')
  if (!encodedClientId || !receivedSignature || extra) return null
  try {
    const expected = Buffer.from(signature(encodedClientId, secret))
    const received = Buffer.from(receivedSignature)
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
    const clientId = Buffer.from(encodedClientId, 'base64url').toString('utf8')
    return UUID_PATTERN.test(clientId) ? clientId : null
  } catch {
    return null
  }
}

export function decryptLegacyPortalToken(value: string) {
  const key = legacyEncryptionKey()
  if (!key) return null
  const [version, ivValue, tagValue, encryptedValue] = value.split('.')
  if (version !== 'v1' || !ivValue || !tagValue || !encryptedValue) return null
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivValue, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    return null
  }
}
