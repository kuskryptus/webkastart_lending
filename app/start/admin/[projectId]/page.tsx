import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { OnboardingProjectDetail } from '@/components/onboarding/onboarding-project-detail'
import { ADMIN_COOKIE_NAME, isAdminCookie } from '@/lib/onboarding/admin-auth'
import { findCoreOnboardingByClientId, listAssets } from '@/lib/onboarding/db'
import { findDiscovery2ByClientId } from '@/lib/onboarding/discovery'
import { sanitizeAnswers } from '@/lib/onboarding/validation'

export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function OnboardingProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const cookieStore = await cookies()
  if (!isAdminCookie(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) redirect('/start')

  const { projectId } = await params
  if (!UUID_PATTERN.test(projectId)) notFound()

  const project = await findCoreOnboardingByClientId(projectId)
  if (!project) notFound()
  const [assets, discovery] = await Promise.all([
    listAssets(project.clientId),
    findDiscovery2ByClientId(project.clientId),
  ])

  return (
    <OnboardingProjectDetail
      answers={sanitizeAnswers(project.answers)}
      assets={assets}
      discovery={discovery}
      project={project}
    />
  )
}
