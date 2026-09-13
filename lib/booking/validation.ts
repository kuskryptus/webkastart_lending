import type { BookingInput, BookingSource } from './types'

export type BookingPayloadResult =
  | { ok: true; value: BookingInput; website: string }
  | { ok: false; error: string }

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function parseBookingPayload(payload: unknown, source: BookingSource): BookingPayloadResult {
  const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const name = cleanText(body.name, 120)
  const email = cleanText(body.email, 160).toLowerCase()
  const phone = cleanText(body.phone, 60)
  const company = cleanText(body.company, 160)
  const note = cleanText(body.note, 2000)
  const website = cleanText(body.website, 100)
  const externalId = source === 'team_go' ? cleanText(body.externalId, 200) || null : null
  const startsAt = typeof body.startsAt === 'string' ? new Date(body.startsAt) : new Date(Number.NaN)

  if (!name || !email || !Number.isFinite(startsAt.getTime())) {
    return { ok: false, error: 'Vyplňte meno, email a vyberte termín.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Zadajte platný email.' }
  }

  return {
    ok: true,
    value: { company, email, externalId, name, note, phone, source, startsAt },
    website,
  }
}
