import type { BookingRecord } from './types'

export function serializeBooking(booking: BookingRecord) {
  return {
    ...booking,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }
}
