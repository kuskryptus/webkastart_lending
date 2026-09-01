import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { checkRateLimit, getDatabase } from '@/lib/onboarding/db'
import { createOrRotateDiscovery2 } from '@/lib/onboarding/discovery'
import { apiError, getClientIp, privateJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ clientId: string }> }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })

  try {
    const { clientId } = await params
    if (!UUID_PATTERN.test(clientId)) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })

    const allowed = await checkRateLimit({ action: 'admin-discovery-2-link', identity: getClientIp(request), limit: 30 })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek. Skúste to o chvíľu.' }, { status: 429 })

    const sql = getDatabase()
    const clients = await sql<{ id: string }[]>`select id from clients where id = ${clientId} limit 1`
    if (!clients[0]) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })

    const { form, token } = await createOrRotateDiscovery2(clientId)
    const siteUrl = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '')
    return privateJson({
      form: {
        currentStep: form.currentStep,
        status: form.status,
        updatedAt: form.updatedAt.toISOString(),
      },
      url: `${siteUrl}/start/discovery/${token}`,
    }, { status: 201 })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}
