import 'server-only'

import type { TransactionSql } from 'postgres'
import { getDatabase } from '@/lib/onboarding/db'
import { getBookingConfig } from './config'
import type { BookingInput, BookingRecord, BookingStatus } from './types'

export class BookingConflictError extends Error {
  constructor() {
    super('BOOKING_CONFLICT')
    this.name = 'BookingConflictError'
  }
}

export class InvalidBookingSlotError extends Error {
  constructor() {
    super('INVALID_BOOKING_SLOT')
    this.name = 'InvalidBookingSlotError'
  }
}

export async function listAvailableSlots() {
  const sql = getDatabase()
  const config = getBookingConfig()
  const slots = await sql<{ startsAt: Date }[]>`
    with local_days as (
      select day::date as local_day
      from generate_series(
        (now() at time zone ${config.timeZone})::date,
        (now() at time zone ${config.timeZone})::date + ${config.windowDays}::int,
        interval '1 day'
      ) as day
    ), candidate_slots as (
      select
        ((local_day + slot_offset * interval '1 minute') at time zone ${config.timeZone}) as starts_at
      from local_days
      cross join generate_series(
        ${config.startMinutes}::int,
        ${config.endMinutes - config.slotMinutes}::int,
        ${config.slotMinutes}::int
      ) as slot_offset
      where extract(isodow from local_day)::int = any(${sql.array(config.weekdays)}::int[])
    )
    select candidate.starts_at as "startsAt"
    from candidate_slots as candidate
    where candidate.starts_at >= now() + ${config.leadHours} * interval '1 hour'
      and not exists (
        select 1
        from consultation_bookings as booking
        where booking.status = 'confirmed'
          and booking.starts_at < candidate.starts_at + ${config.slotMinutes} * interval '1 minute'
          and booking.ends_at > candidate.starts_at
      )
    order by candidate.starts_at
  `
  return { config, slots: slots.map((slot) => slot.startsAt) }
}

async function slotIsAllowed(sql: TransactionSql, startsAt: Date) {
  const config = getBookingConfig()
  const rows = await sql<{ allowed: boolean }[]>`
    select (
      ${startsAt}::timestamptz >= now() + ${config.leadHours} * interval '1 hour'
      and (${startsAt}::timestamptz at time zone ${config.timeZone})::date
        <= (now() at time zone ${config.timeZone})::date + ${config.windowDays}::int
      and extract(isodow from ${startsAt}::timestamptz at time zone ${config.timeZone})::int = any(${sql.array(config.weekdays)}::int[])
      and (
        extract(hour from ${startsAt}::timestamptz at time zone ${config.timeZone})::int * 60
        + extract(minute from ${startsAt}::timestamptz at time zone ${config.timeZone})::int
      ) >= ${config.startMinutes}
      and (
        extract(hour from ${startsAt}::timestamptz at time zone ${config.timeZone})::int * 60
        + extract(minute from ${startsAt}::timestamptz at time zone ${config.timeZone})::int
      ) + ${config.slotMinutes} <= ${config.endMinutes}
      and (
        (
          extract(hour from ${startsAt}::timestamptz at time zone ${config.timeZone})::int * 60
          + extract(minute from ${startsAt}::timestamptz at time zone ${config.timeZone})::int
        ) - ${config.startMinutes}
      ) % ${config.slotMinutes} = 0
    ) as allowed
  `
  return rows[0]?.allowed === true
}

export async function createBooking(input: BookingInput) {
  const sql = getDatabase()
  const config = getBookingConfig()
  const endsAt = new Date(input.startsAt.getTime() + config.slotMinutes * 60_000)

  return sql.begin(async (transaction) => {
    await transaction`select pg_advisory_xact_lock(hashtext('webkastart-consultation-bookings'))`

    if (input.externalId) {
      const existing = await transaction<BookingRecord[]>`
        select
          id, name, email, phone, company, note,
          starts_at as "startsAt", ends_at as "endsAt", status, source,
          external_id as "externalId", created_at as "createdAt", updated_at as "updatedAt"
        from consultation_bookings
        where external_id = ${input.externalId}
        limit 1
      `
      if (existing[0]) return existing[0]
    }

    if (!(await slotIsAllowed(transaction, input.startsAt))) throw new InvalidBookingSlotError()

    const conflicts = await transaction<{ id: string }[]>`
      select id
      from consultation_bookings
      where status = 'confirmed'
        and starts_at < ${endsAt}
        and ends_at > ${input.startsAt}
      limit 1
    `
    if (conflicts[0]) throw new BookingConflictError()

    const rows = await transaction<BookingRecord[]>`
      insert into consultation_bookings (
        name, email, phone, company, note, starts_at, ends_at, source, external_id
      ) values (
        ${input.name}, ${input.email}, ${input.phone}, ${input.company}, ${input.note},
        ${input.startsAt}, ${endsAt}, ${input.source}, ${input.externalId || null}
      )
      returning
        id, name, email, phone, company, note,
        starts_at as "startsAt", ends_at as "endsAt", status, source,
        external_id as "externalId", created_at as "createdAt", updated_at as "updatedAt"
    `
    const booking = rows[0]
    if (!booking) throw new Error('Could not create booking')
    return booking
  }) as Promise<BookingRecord>
}

export async function listBookings(options: {
  from: Date
  to: Date
  status?: BookingStatus
  updatedSince?: Date
  limit: number
}) {
  const sql = getDatabase()
  return sql<BookingRecord[]>`
    select
      id, name, email, phone, company, note,
      starts_at as "startsAt", ends_at as "endsAt", status, source,
      external_id as "externalId", created_at as "createdAt", updated_at as "updatedAt"
    from consultation_bookings
    where starts_at >= ${options.from}
      and starts_at < ${options.to}
      and (${options.status || null}::text is null or status = ${options.status || null})
      and (${options.updatedSince || null}::timestamptz is null or updated_at > ${options.updatedSince || null})
    order by updated_at asc, id asc
    limit ${options.limit}
  `
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const sql = getDatabase()
  return sql.begin(async (transaction) => {
    await transaction`select pg_advisory_xact_lock(hashtext('webkastart-consultation-bookings'))`
    const current = await transaction<{ endsAt: Date; startsAt: Date }[]>`
      select starts_at as "startsAt", ends_at as "endsAt"
      from consultation_bookings
      where id = ${id}
      limit 1
    `
    if (!current[0]) return null

    if (status === 'confirmed') {
      const conflicts = await transaction<{ id: string }[]>`
        select id
        from consultation_bookings
        where id <> ${id}
          and status = 'confirmed'
          and starts_at < ${current[0].endsAt}
          and ends_at > ${current[0].startsAt}
        limit 1
      `
      if (conflicts[0]) throw new BookingConflictError()
    }

    const rows = await transaction<BookingRecord[]>`
      update consultation_bookings
      set status = ${status}, updated_at = now()
      where id = ${id}
      returning
        id, name, email, phone, company, note,
        starts_at as "startsAt", ends_at as "endsAt", status, source,
        external_id as "externalId", created_at as "createdAt", updated_at as "updatedAt"
    `
    return rows[0] ?? null
  }) as Promise<BookingRecord | null>
}
