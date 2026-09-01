'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Cloud, CloudOff, Loader2, PartyPopper } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import {
  emptyDiscovery2Answers,
  type Discovery2Answers,
  type Discovery2Response,
} from '@/lib/onboarding/types'

const TOTAL_STEPS = 5

const questions: Array<{
  key: keyof Discovery2Answers
  label: string
  help: string
  placeholder: string
}> = [
  {
    key: 'order_process',
    label: 'Ako dnes zákazník objednáva a ako celý proces objednávky prebieha?',
    help: 'Popíšte cestu od prvého kontaktu až po odovzdanie alebo doručenie.',
    placeholder: 'Napr. zákazník nám napíše cez Instagram, dohodneme si detaily…',
  },
  {
    key: 'primary_products_and_prices',
    label: 'Aké produkty chcete cez web primárne ponúkať a v akých cenách?',
    help: 'Stačí orientačný prehľad hlavných produktov, služieb alebo balíkov.',
    placeholder: 'Napr. produkt, variant a orientačná cena…',
  },
  {
    key: 'personalization_options',
    label: 'Čo všetko môže zákazník personalizovať?',
    help: 'Uveďte možnosti, z ktorých si zákazník môže vybrať alebo ich upraviť.',
    placeholder: 'Napr. farba, veľkosť, text, materiál…',
  },
  {
    key: 'customer_appreciation',
    label: 'Čo podľa vás zákazníci na vašej tvorbe najviac oceňujú?',
    help: 'Pomôže nám to správne pomenovať vašu hodnotu a odlíšenie.',
    placeholder: 'Napr. osobný prístup, kvalita spracovania, rýchlosť…',
  },
  {
    key: 'must_show_on_website',
    label: 'Je niečo, čo chcete na novom webe určite ukázať?',
    help: 'Môže ísť o konkrétny produkt, príbeh, referenciu, proces alebo detail.',
    placeholder: 'Napíšte čokoľvek, čo na webe nesmie chýbať…',
  },
]

type SaveState = 'idle' | 'saving' | 'saved' | 'offline'

async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null
  return data?.error || 'Niečo sa nepodarilo. Skúste to prosím znova.'
}

export function Discovery2Wizard({ token }: { token: string }) {
  const [answers, setAnswers] = useState<Discovery2Answers>(emptyDiscovery2Answers)
  const [clientLabel, setClientLabel] = useState('')
  const [step, setStep] = useState(1)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [loading, setLoading] = useState(true)
  const [fatalError, setFatalError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reopening, setReopening] = useState(false)
  const hydratedRef = useRef(false)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const backupKey = `webkastart-discovery-2-${token}`

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await fetch(`/api/onboarding/discovery/${token}`, { cache: 'no-store' })
        if (!response.ok) throw new Error(await responseError(response))
        const data = await response.json() as Discovery2Response
        if (cancelled) return

        let nextAnswers = data.answers
        let nextStep = data.currentStep
        const backup = localStorage.getItem(backupKey)
        if (backup) {
          try {
            const local = JSON.parse(backup) as { answers: Discovery2Answers; currentStep: number; savedAt: string }
            if (new Date(local.savedAt) > new Date(data.updatedAt)) {
              nextAnswers = local.answers
              nextStep = local.currentStep
            }
          } catch {
            localStorage.removeItem(backupKey)
          }
        }

        setAnswers({ ...emptyDiscovery2Answers, ...nextAnswers })
        setClientLabel(data.clientLabel)
        setStep(Math.min(TOTAL_STEPS, Math.max(1, nextStep)))
        setCompleted(data.status === 'submitted')
        hydratedRef.current = true
      } catch (error) {
        if (!cancelled) setFatalError(error instanceof Error ? error.message : 'Tento odkaz sa nepodarilo otvoriť.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [backupKey, token])

  const queueSave = useCallback((nextAnswers: Discovery2Answers, nextStep: number) => {
    setSaveState('saving')
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch(`/api/onboarding/discovery/${token}`, {
          body: JSON.stringify({ answers: nextAnswers, currentStep: nextStep }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!response.ok) throw new Error(await responseError(response))
        setSaveState('saved')
      })
      .catch(() => setSaveState('offline'))
    return saveQueueRef.current
  }, [token])

  useEffect(() => {
    if (!hydratedRef.current || completed) return
    const savedAt = new Date().toISOString()
    localStorage.setItem(backupKey, JSON.stringify({ answers, currentStep: step, savedAt }))
    const timeout = window.setTimeout(() => void queueSave(answers, step), 900)
    return () => window.clearTimeout(timeout)
  }, [answers, backupKey, completed, queueSave, step])

  useEffect(() => {
    const retry = () => {
      if (hydratedRef.current && !completed) void queueSave(answers, step)
    }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [answers, completed, queueSave, step])

  function goToStep(nextStep: number) {
    setStep(Math.min(TOTAL_STEPS, Math.max(1, nextStep)))
    setSubmitError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      await saveQueueRef.current
      const response = await fetch(`/api/onboarding/discovery/${token}/submit`, {
        body: JSON.stringify({ answers }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(await responseError(response))
      localStorage.removeItem(backupKey)
      setCompleted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Odpovede sa nepodarilo odoslať.')
    } finally {
      setSubmitting(false)
    }
  }

  async function reopen() {
    setReopening(true)
    setSubmitError('')
    try {
      const response = await fetch(`/api/onboarding/discovery/${token}`, {
        body: JSON.stringify({ answers, currentStep: step, reopen: true }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      if (!response.ok) throw new Error(await responseError(response))
      setCompleted(false)
      setSaveState('saved')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Formulár sa nepodarilo znovu otvoriť.')
    } finally {
      setReopening(false)
    }
  }

  if (loading) {
    return <main className="grid min-h-dvh place-items-center"><div className="text-center"><Loader2 className="mx-auto size-6 animate-spin text-brand" /><p className="mt-4 text-sm text-muted-foreground">Otvárame formulár…</p></div></main>
  }

  if (fatalError) {
    return <main className="grid min-h-dvh place-items-center px-6"><div className="max-w-md text-center"><LogoMark className="mx-auto" /><h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">Tento odkaz nevieme otvoriť</h1><p className="mt-3 leading-7 text-muted-foreground">{fatalError} Skontrolujte prosím celý odkaz.</p></div></main>
  }

  if (completed) {
    return (
      <main className="grid min-h-dvh place-items-center px-5 py-12">
        <div className="max-w-xl text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-brand"><PartyPopper className="size-6" /></span>
          <h1 className="mt-7 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Všetky informácie boli úspešne odoslané.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">Ďakujeme za váš čas. Odpovede máme uložené a môžete sa k nim cez tento odkaz kedykoľvek vrátiť.</p>
          <button type="button" onClick={() => void reopen()} disabled={reopening} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline disabled:opacity-60">
            {reopening && <Loader2 className="size-4 animate-spin" />} {reopening ? 'Otváram formulár…' : 'Znovu otvoriť a niečo doplniť'}
          </button>
          {submitError && <p role="alert" className="mt-4 text-sm text-destructive">{submitError}</p>}
        </div>
      </main>
    )
  }

  const question = questions[step - 1]
  if (!question) return null

  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
        <Link href="/" aria-label="WebkaStart — domovská stránka" className="inline-flex"><LogoMark /></Link>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
          {saveState === 'saving' && <><Loader2 className="size-3.5 animate-spin" /> Ukladám…</>}
          {saveState === 'saved' && <><Cloud className="size-3.5" /> Uložené</>}
          {saveState === 'offline' && <><CloudOff className="size-3.5" /> Uložené v zariadení</>}
        </span>
      </header>

      <div className="mx-auto max-w-3xl px-5 pb-32 pt-3 sm:px-8 sm:pt-7">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Discovery 2{clientLabel ? ` · ${clientLabel}` : ''}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div><h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Poďme trochu viac do hĺbky</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Odpovede sa priebežne ukladajú. Ak pri niečom neviete odpovedať, otázku môžete preskočiť.</p></div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">{step} z {TOTAL_STEPS}</p>
          </div>
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} /></div>
        </div>

        <section key={question.key} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Otázka {step}</p>
          <label htmlFor={question.key} className="mt-3 block">
            <span className="block max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">{question.label}</span>
            <span className="mt-3 block max-w-xl text-sm leading-6 text-muted-foreground">{question.help}</span>
            <textarea
              id={question.key}
              autoFocus
              value={answers[question.key]}
              maxLength={5000}
              onChange={(event) => setAnswers((current) => ({ ...current, [question.key]: event.target.value }))}
              placeholder={question.placeholder}
              className="mt-8 min-h-48 w-full resize-y border-0 border-b border-border bg-transparent px-0 py-4 text-base leading-7 outline-none placeholder:text-muted-foreground/50 focus:border-brand focus:ring-0"
            />
          </label>
          {submitError && <p role="alert" className="mt-5 text-sm text-destructive">{submitError}</p>}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <button type="button" onClick={() => goToStep(step - 1)} disabled={step === 1} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:invisible"><ArrowLeft className="size-4" /> Späť</button>
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={() => goToStep(step + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">Pokračovať <ArrowRight className="size-4" /></button>
          ) : (
            <button type="button" onClick={() => void submit()} disabled={submitting} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{submitting && <Loader2 className="size-4 animate-spin" />} Odoslať odpovede</button>
          )}
        </div>
      </div>
    </main>
  )
}
