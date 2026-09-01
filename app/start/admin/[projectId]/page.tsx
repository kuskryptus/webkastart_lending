import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { AdminClientWorkspace } from '@/components/onboarding/admin-client-workspace'
import { ADMIN_COOKIE_NAME, isAdminCookie } from '@/lib/onboarding/admin-auth'
import { getClientWorkspace } from '@/lib/onboarding/workspace'

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

  const workspace = await getClientWorkspace(projectId)
  if (!workspace) notFound()
  return <AdminClientWorkspace clientId={projectId} initialWorkspace={workspace} />
}
