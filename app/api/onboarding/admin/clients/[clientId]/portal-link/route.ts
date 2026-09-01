import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { checkRateLimit } from '@/lib/onboarding/db'
import { apiError, getClientIp, privateJson } from '@/lib/onboarding/http'
import { createAdditionalPortalToken, getRecoverablePortalToken } from '@/lib/onboarding/portal-links'

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
    const token = await getRecoverablePortalToken(clientId)
    return token
      ? privateJson({ url: portalUrl(request, token) })
      : privateJson({ error: 'Pôvodný link bol uložený iba ako hash a nedá sa zobraziť.', reason: 'not_recoverable' }, { status: 404 })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}

export async function POST(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return unauthorized()
  try {
    const { clientId } = await params
    if (!UUID_PATTERN.test(clientId)) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
    const allowed = await checkRateLimit({ action: 'admin-portal-link-create', identity: getClientIp(request), limit: 20 })
    if (!allowed) return privateJson({ error: 'Príliš veľa vytvorených linkov. Skúste to o chvíľu.' }, { status: 429 })
    const token = await createAdditionalPortalToken(clientId)
    return token
      ? privateJson({ url: portalUrl(request, token) }, { status: 201 })
      : privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}
