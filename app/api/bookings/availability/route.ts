import { listAvailableSlots } from '@/lib/booking/db'
import { checkRateLimit, pruneRateLimits } from '@/lib/onboarding/db'
import { getClientIp, privateJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const allowed = await checkRateLimit({
      action: 'booking-availability',
      identity: getClientIp(request),
      limit: 180,
    })
    void pruneRateLimits()
    if (!allowed) {
      return privateJson({ error: 'Príliš veľa požiadaviek. Skúste to o chvíľu.' }, { status: 429 })
    }

    const { config, slots } = await listAvailableSlots()
    return privateJson({
      durationMinutes: config.slotMinutes,
      timeZone: config.timeZone,
      slots: slots.map((slot) => slot.toISOString()),
    })
  } catch (error) {
    console.error('[booking:availability]', error)
    return privateJson(
      { error: 'Voľné termíny sa momentálne nepodarilo načítať.' },
      { status: error instanceof Error && error.message.includes('DATABASE_URL') ? 503 : 500 },
    )
  }
}
