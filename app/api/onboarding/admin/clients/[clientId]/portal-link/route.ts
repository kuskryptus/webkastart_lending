import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { checkRateLimit, getDatabase } from '@/lib/onboarding/db'
import { apiError, getClientIp, privateJson } from '@/lib/onboarding/http'
import { createPermanentPortalToken, decryptLegacyPortalToken } from '@/lib/onboarding/portal-token'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ clientId: string }> }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function unauthorized() {
  return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })
}

function portalUrl(request: Request, token: string) {
  const siteUrl = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '')
  return `${siteUrl}/portal/${token}`
}

export async function GET(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return unauthorized()
  try {
    const { clientId } = await params
    if (!UUID_PATTERN.test(clientId)) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
    const allowed = await checkRateLimit({ action: 'admin-portal-link-read', identity: getClientIp(request), limit: 120 })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })
    const sql = getDatabase()
    const clients = await sql<{ encryptedToken: string | null; id: string }[]>`
      select client.id, link.encrypted_token as "encryptedToken"
      from clients as client
      left join lateral (
        select encrypted_token
        from client_portal_links
        where client_id = client.id and encrypted_token is not null
        order by created_at asc
        limit 1
      ) as link on true
      where client.id = ${clientId}
      limit 1
    `
    if (!clients[0]) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
    const token = (clients[0].encryptedToken && decryptLegacyPortalToken(clients[0].encryptedToken))
      || createPermanentPortalToken(clientId)
    return token
      ? privateJson({ url: portalUrl(request, token) })
      : privateJson({ error: 'Permanentné klientské linky nie sú nakonfigurované.' }, { status: 503 })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}
