import { notFound } from 'next/navigation'
import { Discovery2Wizard } from '@/components/onboarding/discovery-2-wizard'
import { ONBOARDING_TOKEN_PATTERN } from '@/lib/onboarding/validation'

export const dynamic = 'force-dynamic'

export default async function Discovery2Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!ONBOARDING_TOKEN_PATTERN.test(token)) notFound()
  return <Discovery2Wizard token={token} />
}
