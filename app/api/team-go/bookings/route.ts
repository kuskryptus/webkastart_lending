import { BookingConflictError, createBooking, InvalidBookingSlotError, listBookings } from '@/lib/booking/db'
import { isTeamGoRequest, teamGoCorsHeaders, teamGoJson } from '@/lib/booking/auth'
import { serializeBooking } from '@/lib/booking/serialize'
import { sendBookingEmails } from '@/lib/booking/email'
import { parseBookingPayload } from '@/lib/booking/validation'
import { readSmallJson } from '@/lib/onboarding/http'
import type { BookingStatus } from '@/lib/booking/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function validDate(value: string | null, fallback: Date) {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : fallback
}

function unauthorized(request: Request) {
  return teamGoJson(request, { error: 'Neplatný alebo chýbajúci API kľúč.' }, { status: 401 })
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: teamGoCorsHeaders(request) })
}

export async function GET(request: Request) {
  if (!isTeamGoRequest(request)) return unauthorized(request)

  try {
    const url = new URL(request.url)
    const now = new Date()
    const from = validDate(url.searchParams.get('from'), new Date(now.getTime() - 30 * 86_400_000))
    const to = validDate(url.searchParams.get('to'), new Date(now.getTime() + 180 * 86_400_000))
    const updatedSinceValue = url.searchParams.get('updatedSince')
    const updatedSince = updatedSinceValue ? validDate(updatedSinceValue, new Date(0)) : undefined
    const statusValue = url.searchParams.get('status')
    const status: BookingStatus | undefined = statusValue === 'confirmed' || statusValue === 'cancelled'
      ? statusValue
      : undefined
    const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get('limit') || '200', 10) || 200, 1), 500)

    if (to <= from || to.getTime() - from.getTime() > 2 * 365 * 86_400_000) {
      return teamGoJson(request, { error: 'Neplatný rozsah dátumov.' }, { status: 422 })
    }

    const bookings = await listBookings({ from, limit, status, to, updatedSince })
    const serialized = bookings.map(serializeBooking)
    return teamGoJson(request, {
      bookings: serialized,
      nextUpdatedSince: serialized.at(-1)?.updatedAt || updatedSince?.toISOString() || null,
    })
  } catch (error) {
    console.error('[team-go:bookings:list]', error)
    return teamGoJson(request, { error: 'Rezervácie sa nepodarilo načítať.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isTeamGoRequest(request)) return unauthorized(request)

  try {
    let payload: unknown
    try {
      payload = await readSmallJson(request, 10_000)
    } catch {
      return teamGoJson(request, { error: 'Neplatná požiadavka.' }, { status: 400 })
    }
    const parsed = parseBookingPayload(payload, 'team_go')
    if (!parsed.ok) return teamGoJson(request, { error: parsed.error }, { status: 422 })

    const booking = await createBooking(parsed.value)
    const emailSent = await sendBookingEmails(booking)
    return teamGoJson(request, { booking: serializeBooking(booking), emailSent }, { status: 201 })
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return teamGoJson(request, { error: 'Termín sa prekrýva s existujúcou rezerváciou.' }, { status: 409 })
    }
    if (error instanceof InvalidBookingSlotError) {
      return teamGoJson(request, { error: 'Termín nie je v povolenom rezervačnom okne.' }, { status: 422 })
    }
    console.error('[team-go:bookings:create]', error)
    return teamGoJson(request, { error: 'Rezerváciu sa nepodarilo vytvoriť.' }, { status: 500 })
  }
}
