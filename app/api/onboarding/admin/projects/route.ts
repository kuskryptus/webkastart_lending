import { checkRateLimit, createOnboardingProject, listOnboardingProjects } from '@/lib/onboarding/db'
import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { apiError, getClientIp, privateJson, readSmallJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function unauthorized() {
  return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const allowed = await checkRateLimit({ action: 'admin-list', identity: getClientIp(request), limit: 120 })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })

    const projects = await listOnboardingProjects()
    return privateJson({
      projects: projects.map((project) => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        lastActivityAt: project.lastActivityAt.toISOString(),
        submittedAt: project.submittedAt?.toISOString() || null,
      })),
    })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const allowed = await checkRateLimit({ action: 'admin-create', identity: getClientIp(request), limit: 20 })
    if (!allowed) return privateJson({ error: 'Príliš veľa vytvorených linkov. Skúste to o chvíľu.' }, { status: 429 })

    let payload: unknown
    try {
      payload = await readSmallJson(request, 5_000)
    } catch {
      return privateJson({ error: 'Neplatná požiadavka.' }, { status: 400 })
    }
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const clientLabel = typeof body.clientLabel === 'string' ? body.clientLabel.trim().slice(0, 200) : ''
    if (!clientLabel) {
      return privateJson({ error: 'Napíšte názov klienta alebo projektu.' }, { status: 422 })
    }

    const project = await createOnboardingProject(clientLabel)
    const requestOrigin = new URL(request.url).origin
    const siteUrl = (process.env.SITE_URL || requestOrigin).replace(/\/$/, '')
    return privateJson({
      project: {
        clientLabel,
        createdAt: project.createdAt.toISOString(),
        currentStep: 1,
        id: project.id,
        lastActivityAt: project.createdAt.toISOString(),
        status: 'not_started',
        submittedAt: null,
      },
      url: `${siteUrl}/start/${project.token}`,
    }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
