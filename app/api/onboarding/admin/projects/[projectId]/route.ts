import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { checkRateLimit } from '@/lib/onboarding/db'
import { apiError, getClientIp, privateJson } from '@/lib/onboarding/http'
import { deleteOnboardingProject } from '@/lib/onboarding/project-deletion'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ projectId: string }> }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function DELETE(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })

  try {
    const { projectId } = await params
    if (!UUID_PATTERN.test(projectId)) return privateJson({ error: 'Formulár sa nenašiel.' }, { status: 404 })
    const allowed = await checkRateLimit({ action: 'admin-delete', identity: getClientIp(request), limit: 20 })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek. Skúste to o chvíľu.' }, { status: 429 })

    const deleted = await deleteOnboardingProject(projectId)
    return deleted
      ? privateJson({ ok: true })
      : privateJson({ error: 'Formulár sa nenašiel.' }, { status: 404 })
  } catch (error) {
    return apiError(error)
  }
}
