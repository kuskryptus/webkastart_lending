import { notFound } from 'next/navigation'
import { ClientWorkspace } from '@/components/onboarding/client-workspace'
import { ONBOARDING_TOKEN_PATTERN } from '@/lib/onboarding/validation'
import { findClientByPortalToken, getClientWorkspace } from '@/lib/onboarding/workspace'

export const dynamic = 'force-dynamic'

export default async function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!ONBOARDING_TOKEN_PATTERN.test(token)) notFound()
  const client = await findClientByPortalToken(token)
  if (!client) notFound()
  const workspace = await getClientWorkspace(client.id, { visibleOnly: true })
  if (!workspace) notFound()
  return <ClientWorkspace initialWorkspace={workspace} token={token} />
}
