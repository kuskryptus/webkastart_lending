import { notFound } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { ONBOARDING_TOKEN_PATTERN } from '@/lib/onboarding/validation'

export const dynamic = 'force-dynamic'

export default async function StartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!ONBOARDING_TOKEN_PATTERN.test(token)) notFound()

  return (
    <OnboardingWizard
      token={token}
      filesEmail={process.env.CONTACT_TO_EMAIL || 'kontakt@webkastart.sk'}
      filesPhone={process.env.CONTACT_WHATSAPP_PHONE || '0950591354'}
      privacyPolicyUrl={process.env.PRIVACY_POLICY_URL || undefined}
    />
  )
}
