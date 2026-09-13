'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  LoaderCircle,
  Mail,
  UserRound,
  Video,
} from 'lucide-react'

type Availability = {
  durationMinutes: number
  slots: string[]
  timeZone: string
}

type BookingResponse = {
  booking?: {
    id: string
    name: string
    email: string
    startsAt: string
    endsAt: string
  }
  emailSent?: boolean
  error?: string
}

type Step = 'schedule' | 'details' | 'success'

const inputClassName =
  'h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15'

function zonedDateKey(value: string | Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function formatDate(value: string, timeZone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('sk-SK', { ...options, timeZone }).format(new Date(value))
}

function monthFromKey(key: string) {
  const [year, month] = key.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1))
}

function monthKey(month: Date) {
  return `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, '0')}`
}

function addMonths(month: Date, amount: number) {
  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + amount, 1))
}

export function BookingCalendar() {
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [visibleMonth, setVisibleMonth] = useState<Date | null>(null)
  const [step, setStep] = useState<Step>('schedule')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse['booking']>()
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(true)

  const loadAvailability = useCallback(async (preserveSelection = false) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/bookings/availability', { cache: 'no-store' })
      const result = await response.json().catch(() => null) as Availability & { error?: string } | null
      if (!response.ok || !result) throw new Error(result?.error || 'Voľné termíny sa nepodarilo načítať.')

      setAvailability(result)
      const keys = [...new Set(result.slots.map((slot) => zonedDateKey(slot, result.timeZone)))]
      const nextDate = preserveSelection && keys.includes(selectedDate) ? selectedDate : keys[0] || ''
      setSelectedDate(nextDate)
      setVisibleMonth(nextDate ? monthFromKey(nextDate) : null)
      if (!result.slots.includes(selectedSlot)) setSelectedSlot('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Voľné termíny sa nepodarilo načítať.')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedSlot])

  useEffect(() => {
    let active = true
    fetch('/api/bookings/availability', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json().catch(() => null) as Availability & { error?: string } | null
        if (!response.ok || !result) throw new Error(result?.error || 'Voľné termíny sa nepodarilo načítať.')
        return result
      })
      .then((result) => {
        if (!active) return
        setAvailability(result)
        const keys = [...new Set(result.slots.map((slot) => zonedDateKey(slot, result.timeZone)))]
        const firstDate = keys[0] || ''
        setSelectedDate(firstDate)
        setVisibleMonth(firstDate ? monthFromKey(firstDate) : null)
        setLoading(false)
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : 'Voľné termíny sa nepodarilo načítať.')
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, string[]>()
    if (!availability) return grouped
    for (const slot of availability.slots) {
      const key = zonedDateKey(slot, availability.timeZone)
      grouped.set(key, [...(grouped.get(key) || []), slot])
    }
    return grouped
  }, [availability])

  const dateKeys = useMemo(() => [...slotsByDate.keys()].sort(), [slotsByDate])
  const firstMonth = dateKeys[0]?.slice(0, 7) || ''
  const lastMonth = dateKeys.at(-1)?.slice(0, 7) || ''
  const currentMonthKey = visibleMonth ? monthKey(visibleMonth) : ''
  const monthDays = useMemo(() => {
    if (!visibleMonth) return []
    const year = visibleMonth.getUTCFullYear()
    const month = visibleMonth.getUTCMonth()
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const leadingBlanks = (visibleMonth.getUTCDay() + 6) % 7
    return [
      ...Array.from({ length: leadingBlanks }, () => null),
      ...Array.from({ length: days }, (_, index) => {
        const day = index + 1
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return { day, key }
      }),
    ]
  }, [visibleMonth])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    setError('')

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      company: String(formData.get('company') || ''),
      email: String(formData.get('email') || ''),
      name: String(formData.get('name') || ''),
      note: String(formData.get('note') || ''),
      phone: String(formData.get('phone') || ''),
      startsAt: selectedSlot,
      website: String(formData.get('website') || ''),
    }

    try {
      const response = await fetch('/api/bookings', {
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = await response.json().catch(() => null) as BookingResponse | null
      if (!response.ok || !result?.booking) {
        if (response.status === 409 || response.status === 422) {
          setStep('schedule')
          await loadAvailability()
        }
        throw new Error(result?.error || 'Rezerváciu sa nepodarilo uložiť.')
      }
      setConfirmedBooking(result.booking)
      setConfirmationEmailSent(result.emailSent !== false)
      setStep('success')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Rezerváciu sa nepodarilo uložiť.')
    } finally {
      setSubmitting(false)
    }
  }

  const timeZone = availability?.timeZone || 'Europe/Bratislava'
  const duration = availability?.durationMinutes || 60
  const displaySlot = confirmedBooking?.startsAt || selectedSlot

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="grid lg:grid-cols-[0.82fr_1.35fr]">
        <aside className="border-b border-border bg-secondary/45 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Video className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">WebkaStart</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Úvodná online konzultácia</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Prejdeme váš nápad, aktuálnu situáciu a dohodneme si najlepší ďalší krok.
          </p>

          <div className="mt-7 grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Clock3 className="size-4 text-brand" aria-hidden="true" />
              {duration} minút
            </div>
            <div className="flex items-center gap-3">
              <Video className="size-4 text-brand" aria-hidden="true" />
              Online stretnutie
            </div>
            <div className="flex items-center gap-3">
              <Globe2 className="size-4 text-brand" aria-hidden="true" />
              Časové pásmo Bratislava
            </div>
          </div>

          {displaySlot && (
            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Vybraný termín</p>
              <p className="mt-2 text-sm font-semibold capitalize">
                {formatDate(displaySlot, timeZone, { dateStyle: 'full' })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(displaySlot, timeZone, { hour: '2-digit', minute: '2-digit' })} –{' '}
                {formatDate(
                  new Date(new Date(displaySlot).getTime() + duration * 60_000).toISOString(),
                  timeZone,
                  { hour: '2-digit', minute: '2-digit' },
                )}
              </p>
            </div>
          )}
        </aside>

        <div className="p-6 sm:p-8 lg:p-10">
          {step === 'schedule' && (
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-brand">1 z 2</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight">Vyberte si termín</h3>
                </div>
                <CalendarDays className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>

              {loading ? (
                <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
                  <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Načítavam voľné termíny…
                </div>
              ) : error && !availability ? (
                <div className="flex min-h-80 flex-col items-center justify-center text-center">
                  <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadAvailability()}
                    className="mt-4 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    Skúsiť znova
                  </button>
                </div>
              ) : dateKeys.length === 0 ? (
                <div className="flex min-h-80 items-center justify-center text-center text-sm text-muted-foreground">
                  Momentálne nie sú vypísané žiadne voľné termíny. Napíšte mi prosím cez kontakt.
                </div>
              ) : (
                <>
                  <div className="mt-7">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold capitalize">
                        {visibleMonth && new Intl.DateTimeFormat('sk-SK', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(visibleMonth)}
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="Predchádzajúci mesiac"
                          disabled={currentMonthKey <= firstMonth}
                          onClick={() => visibleMonth && setVisibleMonth(addMonths(visibleMonth, -1))}
                          className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronLeft className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label="Nasledujúci mesiac"
                          disabled={currentMonthKey >= lastMonth}
                          onClick={() => visibleMonth && setVisibleMonth(addMonths(visibleMonth, 1))}
                          className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
                      {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((day) => <span key={day}>{day}</span>)}
                    </div>
                    <div className="mt-2 grid grid-cols-7 gap-1">
                      {monthDays.map((date, index) => date ? (
                        <button
                          type="button"
                          key={date.key}
                          disabled={!slotsByDate.has(date.key)}
                          aria-pressed={selectedDate === date.key}
                          onClick={() => {
                            setSelectedDate(date.key)
                            setSelectedSlot('')
                          }}
                          className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                            selectedDate === date.key
                              ? 'bg-brand text-brand-foreground'
                              : slotsByDate.has(date.key)
                                ? 'hover:bg-brand-soft hover:text-brand'
                                : 'cursor-default text-muted-foreground/35'
                          }`}
                        >
                          {date.day}
                        </button>
                      ) : <span key={`blank-${index}`} />)}
                    </div>
                  </div>

                  <div className="mt-7 border-t border-border pt-6">
                    <p className="text-sm font-semibold">
                      {selectedDate && formatDate(`${selectedDate}T12:00:00Z`, 'UTC', { dateStyle: 'long' })}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(slotsByDate.get(selectedDate) || []).map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          aria-pressed={selectedSlot === slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                            selectedSlot === slot
                              ? 'border-brand bg-brand-soft text-brand'
                              : 'border-border hover:border-brand/50 hover:bg-secondary'
                          }`}
                        >
                          {formatDate(slot, timeZone, { hour: '2-digit', minute: '2-digit' })}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

                  <button
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => {
                      setError('')
                      setStep('details')
                    }}
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Pokračovať
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          )}

          {step === 'details' && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setStep('schedule')
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Späť na termíny
              </button>
              <p className="mt-6 text-sm font-medium text-brand">2 z 2</p>
              <h3 className="mt-1 text-xl font-bold tracking-tight">Vaše kontaktné údaje</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Potvrdenie termínu vám pošlem emailom.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                <input aria-hidden="true" autoComplete="off" className="sr-only" name="website" tabIndex={-1} type="text" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    Meno a priezvisko
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
                      <input className={`${inputClassName} pl-9`} name="name" autoComplete="name" required placeholder="Vaše meno" />
                    </div>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Email
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
                      <input className={`${inputClassName} pl-9`} name="email" type="email" autoComplete="email" required placeholder="vas@email.sk" />
                    </div>
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    Telefón <span className="sr-only">(nepovinné)</span>
                    <input className={inputClassName} name="phone" type="tel" autoComplete="tel" placeholder="Nepovinné" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Firma <span className="sr-only">(nepovinné)</span>
                    <input className={inputClassName} name="company" autoComplete="organization" placeholder="Nepovinné" />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium">
                  Čo chcete prebrať? <span className="font-normal text-muted-foreground">(nepovinné)</span>
                  <textarea
                    className="min-h-24 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15"
                    name="note"
                    maxLength={2000}
                    placeholder="Stačí jedna alebo dve vety."
                  />
                </label>

                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <p className="text-xs leading-5 text-muted-foreground">
                  Údaje použijem iba na vybavenie vašej rezervácie a komunikáciu k stretnutiu.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
                >
                  {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
                  {submitting ? 'Rezervujem termín…' : 'Potvrdiť rezerváciu'}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && confirmedBooking && (
            <div className="flex min-h-[28rem] flex-col justify-center">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Check className="size-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">Termín je rezervovaný</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                {confirmationEmailSent ? (
                  <>Potvrdenie som poslal na <strong className="font-semibold text-foreground">{confirmedBooking.email}</strong>. Teším sa na stretnutie.</>
                ) : (
                  <>Rezervácia je bezpečne uložená. Potvrdzovací email momentálne neodišiel, preto si prosím termín poznačte.</>
                )}
              </p>
              <div className="mt-6 flex items-start gap-3 border-y border-border py-5">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {formatDate(confirmedBooking.startsAt, timeZone, { dateStyle: 'full' })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(confirmedBooking.startsAt, timeZone, { hour: '2-digit', minute: '2-digit' })} · {duration} minút
                  </p>
                </div>
              </div>
              <Link href="/" className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand hover:underline">
                Späť na WebkaStart
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
