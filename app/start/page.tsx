import { cookies } from 'next/headers'
import { OnboardingAdmin } from '@/components/onboarding/onboarding-admin'
import { ADMIN_COOKIE_NAME, isAdminConfigured, isAdminCookie } from '@/lib/onboarding/admin-auth'
import { listOnboardingProjects } from '@/lib/onboarding/db'
import { getErrorDetails } from '@/lib/onboarding/http'
import type { OnboardingStatus } from '@/lib/onboarding/types'

export const dynamic = 'force-dynamic'

export default async function StartAdminPage() {
  const cookieStore = await cookies()
  const configured = isAdminConfigured()
  const authenticated = isAdminCookie(cookieStore.get(ADMIN_COOKIE_NAME)?.value)
  let initialError = ''
  let initialProjects: Array<{
    clientLabel: string
    createdAt: Date
    currentStep: number
    id: string
    lastActivityAt: Date
    status: OnboardingStatus
    submittedAt: Date | null
  }> = []

  if (configured && authenticated) {
    try {
      initialProjects = [...await listOnboardingProjects()]
    } catch (error) {
      initialError = `Prehľad sa nepodarilo načítať.\n${getErrorDetails(error)}`
    }
  }

  return (
    <OnboardingAdmin
      configured={configured}
      initialAuthenticated={authenticated}
      initialError={initialError}
      initialProjects={initialProjects.map((project) => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        lastActivityAt: project.lastActivityAt.toISOString(),
        submittedAt: project.submittedAt?.toISOString() || null,
      }))}
    />
  )
}
