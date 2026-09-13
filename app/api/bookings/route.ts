import { BookingConflictError, createBooking, InvalidBookingSlotError } from '@/lib/booking/db'
import { sendBookingEmails } from '@/lib/booking/email'
import { serializeBooking } from '@/lib/booking/serialize'
import { parseBookingPayload } from '@/lib/booking/validation'
import { checkRateLimit, pruneRateLimits } from '@/lib/onboarding/db'
import { getClientIp, privateJson, readSmallJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const allowed = await checkRateLimit({
      action: 'booking-create',
      identity: getClientIp(request),
      limit: 15,
    })
    void pruneRateLimits()
    if (!allowed) {
      return privateJson({ error: 'Príliš veľa požiadaviek. Skúste to o chvíľu.' }, { status: 429 })
    }

    let payload: unknown
    try {
      payload = await readSmallJson(request, 10_000)
    } catch {
      return privateJson({ error: 'Neplatná požiadavka.' }, { status: 400 })
    }

    const parsed = parseBookingPayload(payload, 'website')
    if (!parsed.ok) return privateJson({ error: parsed.error }, { status: 422 })
    if (parsed.website) return privateJson({ ok: true })

    const booking = await createBooking(parsed.value)
    const emailSent = await sendBookingEmails(booking)
    return privateJson({ booking: serializeBooking(booking), emailSent, ok: true }, { status: 201 })
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return privateJson(
        { error: 'Tento termín si práve rezervoval niekto iný. Vyberte si prosím ďalší.' },
        { status: 409 },
      )
    }
    if (error instanceof InvalidBookingSlotError) {
      return privateJson(
        { error: 'Tento termín už nie je dostupný. Vyberte si prosím iný.' },
        { status: 422 },
      )
    }
    console.error('[booking:create]', error)
    return privateJson(
      { error: 'Rezerváciu sa nepodarilo uložiť. Skúste to prosím znova.' },
      { status: error instanceof Error && error.message.includes('DATABASE_URL') ? 503 : 500 },
    )
  }
}
