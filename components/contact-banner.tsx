'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  IdCard,
  LoaderCircle,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  X,
} from 'lucide-react'

const contactEmail = 'kampczykristian@gmail.com'
const contactPhone = '+421 950 591 354'
const contactPhoneHref = 'tel:+421950591354'
const businessRegisterUrl = 'https://zrsr.sk/Detail/eHqSPk-psW-veY-qc0QOg4PXyDh5iWz6CDFeEpTooHk'

const inputClassName =
  'h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15'

const textareaClassName =
  'min-h-32 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15'

type SubmitState = 'idle' | 'sending' | 'sent' | 'not-configured' | 'server-missing' | 'error'

function createContactPayload(form: HTMLFormElement) {
  const data = new FormData(form)
  const name = String(data.get('name') || '').trim()
  const email = String(data.get('email') || '').trim()
  const phone = String(data.get('phone') || '').trim()
  const message = String(data.get('message') || '').trim()
  const website = String(data.get('website') || '').trim()

  return { email, message, name, phone, website }
}

type OpenContactFormEvent = CustomEvent<{
  message?: string
}>

export function ContactBanner() {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  useEffect(() => {
    function openFromHash(event?: Event) {
      const detail = (event as OpenContactFormEvent | undefined)?.detail

      if (detail?.message) {
        setMessage(detail.message)
      }

      if (window.location.hash === '#kontakt-formular' || event?.type === 'open-contact-form') {
        setSubmitState('idle')
        setOpen(true)
      }
    }

    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    window.addEventListener('open-contact-form', openFromHash)
    return () => {
      window.removeEventListener('hashchange', openFromHash)
      window.removeEventListener('open-contact-form', openFromHash)
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    setSubmitState('sending')

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify(createContactPayload(form)),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      const contentType = response.headers.get('content-type') || ''
      const result = await response.json().catch(() => null)

      if (response.ok) {
        form.reset()
        setMessage('')
        setSubmitState('sent')
        return
      }

      if (
        result?.reason === 'not_configured' ||
        response.status === 404 ||
        response.status === 405 ||
        contentType.includes('text/html')
      ) {
        setSubmitState(response.status === 404 || response.status === 405 ? 'server-missing' : 'not-configured')
        return
      }

      setSubmitState('error')
    } catch {
      setSubmitState('error')
    }
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(contactEmail)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setMessage('')
      setSubmitState('idle')
    }

    if (!nextOpen && window.location.hash === '#kontakt-formular') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }

  return (
    <section id="kontakt" className="mx-auto max-w-6xl px-5 py-6 sm:px-6 lg:pb-16">
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <div className="rounded-3xl border border-brand/10 bg-brand-soft/70 px-6 py-9 shadow-card sm:px-10 lg:px-12 lg:py-11">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-pretty text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                Máš nápad alebo problém, ktorý by sa dal vyriešiť aplikáciou?
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Ozvi sa mi cez krátky formulár a pozrieme sa na to spolu. Bez záväzkov.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:min-w-max">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {copied ? (
                  <CheckCircle2 className="size-4 text-brand" aria-hidden="true" />
                ) : (
                  <Copy className="size-4 text-brand" aria-hidden="true" />
                )}
                {copied ? 'Email skopírovaný' : 'Kopírovať email'}
              </button>
              <Dialog.Trigger
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring/30"
              >
                Napíš mi správu
                <ArrowRight className="size-4" aria-hidden="true" />
              </Dialog.Trigger>
            </div>
          </div>
        </div>

        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-foreground/35 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto px-4 py-6">
            <Dialog.Popup className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-card-hover outline-none transition-all data-[ending-style]:scale-98 data-[ending-style]:opacity-0 data-[starting-style]:scale-98 data-[starting-style]:opacity-0">
              <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
                <div>
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <MessageSquareText className="size-5" aria-hidden="true" />
                  </div>
                  <Dialog.Title className="text-xl font-semibold tracking-tight">
                    Napíš mi, čo potrebuješ vyriešiť
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Čím konkrétnejšie opíšeš nápad, problém alebo cieľ, tým rýchlejšie ti viem poslať rozumný návrh ďalšieho kroku.
                  </Dialog.Description>
                </div>

                <Dialog.Close
                  aria-label="Zavrieť kontaktný formulár"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-3 focus:ring-ring/30"
                >
                  <X className="size-4" aria-hidden="true" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-5 sm:px-6">
                <input
                  aria-hidden="true"
                  autoComplete="off"
                  className="sr-only"
                  name="website"
                  tabIndex={-1}
                  type="text"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    Meno
                    <input
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className={inputClassName}
                      placeholder="Tvoje meno"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Email
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={inputClassName}
                      placeholder="tvoj@email.sk"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-medium">
                  <span className="flex items-center gap-2">
                    Telefón
                    <span className="text-xs font-normal text-muted-foreground">nepovinné</span>
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={inputClassName}
                    placeholder="+421 ..."
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Správa
                  <textarea
                    name="message"
                    required
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className={textareaClassName}
                    placeholder="Stručne popíš, čo chceš vyriešiť, pre koho to je a aký výsledok očakávaš."
                  />
                </label>

                <div aria-live="polite">
                  {submitState === 'sent' ? (
                    <div className="flex items-start gap-3 rounded-lg border border-brand/20 bg-brand-soft/60 px-4 py-3 text-sm leading-6 text-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                      Správa bola odoslaná. Ozvem sa ti čo najskôr.
                    </div>
                  ) : null}

                  {submitState === 'not-configured' ? (
                    <div className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground">
                      Email služba ešte nie je nakonfigurovaná. Použi kopírovanie emailu nižšie a napíš mi priamo.
                    </div>
                  ) : null}

                  {submitState === 'server-missing' ? (
                    <div className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground">
                      Kontaktný formulár ešte nie je spustený na serveri. Použi kopírovanie emailu nižšie a napíš mi priamo.
                    </div>
                  ) : null}

                  {submitState === 'error' ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-foreground">
                      Správu sa nepodarilo odoslať. Skús to prosím znova alebo si skopíruj email nižšie.
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-3 focus:ring-ring/30"
                  >
                    {copied ? (
                      <CheckCircle2 className="size-4 text-brand" aria-hidden="true" />
                    ) : (
                      <Copy className="size-4 text-brand" aria-hidden="true" />
                    )}
                    {copied ? 'Email skopírovaný' : 'Kopírovať email'}
                  </button>

                  <button
                    type="submit"
                    disabled={submitState === 'sending'}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring/30 disabled:pointer-events-none disabled:opacity-70"
                  >
                    {submitState === 'sending' ? (
                      <>
                        Odosielam
                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        Odoslať správu
                        <Send className="size-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="mt-6 grid gap-6 rounded-2xl border border-border bg-card px-5 py-6 shadow-sm sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Kontaktné a obchodné údaje
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            Kristián Kampczyk
          </h3>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Mail className="size-4 text-brand" aria-hidden="true" />
              {contactEmail}
            </a>
            <a
              href={contactPhoneHref}
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Phone className="size-4 text-brand" aria-hidden="true" />
              {contactPhone}
            </a>
          </div>
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="grid gap-1">
            <dt className="inline-flex items-center gap-2 font-medium text-foreground">
              <Building2 className="size-4 text-brand" aria-hidden="true" />
              Obchodné meno
            </dt>
            <dd className="text-muted-foreground">Kristián Kampczyk</dd>
          </div>

          <div className="grid gap-1">
            <dt className="inline-flex items-center gap-2 font-medium text-foreground">
              <IdCard className="size-4 text-brand" aria-hidden="true" />
              IČO
            </dt>
            <dd className="text-muted-foreground">57723940</dd>
          </div>

          <div className="grid gap-1">
            <dt className="inline-flex items-center gap-2 font-medium text-foreground">
              <MapPin className="size-4 text-brand" aria-hidden="true" />
              Miesto podnikania
            </dt>
            <dd className="text-muted-foreground">
              Nitrianska 2439/6
              <br />
              052 01 Spišská Nová Ves
            </dd>
          </div>

          <div className="grid gap-1">
            <dt className="inline-flex items-center gap-2 font-medium text-foreground">
              <ExternalLink className="size-4 text-brand" aria-hidden="true" />
              Register
            </dt>
            <dd>
              <a
                href={businessRegisterUrl}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                Živnostenský register
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
