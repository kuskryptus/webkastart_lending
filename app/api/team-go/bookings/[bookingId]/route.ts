import { isTeamGoRequest, teamGoCorsHeaders, teamGoJson } from '@/lib/booking/auth'
import { serializeBooking } from '@/lib/booking/serialize'
import { BookingConflictError, updateBookingStatus } from '@/lib/booking/db'
import { readSmallJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: teamGoCorsHeaders(request) })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  if (!isTeamGoRequest(request)) {
    return teamGoJson(request, { error: 'Neplatný alebo chýbajúci API kľúč.' }, { status: 401 })
  }

  const { bookingId } = await context.params
  if (!UUID_PATTERN.test(bookingId)) {
    return teamGoJson(request, { error: 'Neplatné ID rezervácie.' }, { status: 404 })
  }

  try {
    let payload: unknown
    try {
      payload = await readSmallJson(request, 2_000)
    } catch {
      return teamGoJson(request, { error: 'Neplatná požiadavka.' }, { status: 400 })
    }
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    if (body.status !== 'confirmed' && body.status !== 'cancelled') {
      return teamGoJson(request, { error: 'Stav musí byť confirmed alebo cancelled.' }, { status: 422 })
    }

    const booking = await updateBookingStatus(bookingId, body.status)
    if (!booking) return teamGoJson(request, { error: 'Rezervácia sa nenašla.' }, { status: 404 })
    return teamGoJson(request, { booking: serializeBooking(booking) })
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return teamGoJson(request, { error: 'Termín už obsadila iná potvrdená rezervácia.' }, { status: 409 })
    }
    console.error('[team-go:bookings:update]', error)
    return teamGoJson(request, { error: 'Rezerváciu sa nepodarilo upraviť.' }, { status: 500 })
  }
}
