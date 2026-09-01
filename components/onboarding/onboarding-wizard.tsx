'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Cloud, CloudOff, Copy, Loader2, PartyPopper, Plus, X } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { UploadField } from '@/components/onboarding/upload-field'
import {
  emptyOnboardingAnswers,
  type OnboardingAnswers,
  type OnboardingAsset,
  type OnboardingProjectResponse,
} from '@/lib/onboarding/types'
import { validateContact } from '@/lib/onboarding/validation'

const TOTAL_STEPS = 6

const desiredActionOptions = [
  'Zavolať mi', 'Napísať e-mail', 'Poslať kontaktný formulár', 'Rezervovať termín',
  'Pozrieť si moje služby', 'Kúpiť produkt', 'Nie som si istý/istá', 'Iné',
]
const sectionOptions = [
  'O mne / o firme', 'Služby', 'Cenník', 'Referencie', 'Ukážky práce / portfólio',
  'Galéria', 'Kontakt', 'Kontaktný formulár', 'Mapa', 'Sociálne siete',
  'Často kladené otázky', 'Nie som si istý/istá – navrhnite mi to vy',
]
const futureOptions = [
  'Zatiaľ neviem', 'Ďalšie podstránky', 'Blog', 'Rezervácie', 'E-shop',
  'Viac jazykov', 'Newsletter', 'Iné',
]
const designOptions = [
  'Moderný', 'Jednoduchý', 'Elegantný', 'Prémiový', 'Osobný', 'Hravý',
  'Minimalistický', 'Profesionálny', 'Výrazný', 'Neviem – navrhnite mi to',
]
const communicationOptions = ['E-mail', 'Telefón', 'WhatsApp', 'Je mi to jedno']

type SaveState = 'idle' | 'saving' | 'saved' | 'offline'

function OptionalHint({ children = 'Neviete odpovedať? Pokojne túto otázku preskočte.' }: { children?: ReactNode }) {
  return <p className="mt-2 text-sm leading-6 text-muted-foreground">{children}</p>
}

function Field({
  error,
  hint,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string; hint?: string; label: string }) {
  const id = props.id || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label htmlFor={id} className="block">
      <span className="text-base font-semibold tracking-[-0.01em]">{label}</span>
      {hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-3 w-full border-0 border-b bg-transparent px-0 py-3 text-base text-foreground caret-foreground outline-none transition-colors placeholder:text-muted-foreground/55 focus:border-brand focus:ring-0 ${error ? 'border-destructive' : 'border-border'}`}
      />
      {error && <span id={`${id}-error`} className="mt-2 block text-sm text-destructive">{error}</span>}
    </label>
  )
}

function TextArea({
  hint,
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hint?: string; label: string }) {
  const id = props.id || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label htmlFor={id} className="block">
      <span className="text-base font-semibold tracking-[-0.01em]">{label}</span>
      {hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}
      <textarea
        {...props}
        id={id}
        className="mt-3 min-h-28 w-full resize-y border-0 border-b border-border bg-transparent px-0 py-3 text-base leading-7 text-foreground caret-foreground outline-none transition-colors placeholder:text-muted-foreground/55 focus:border-brand focus:ring-0"
      />
    </label>
  )
}

function BulletListField({
  hint,
  label,
  onChange,
  placeholder,
  value,
}: {
  hint?: string
  label: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  const items = value ? value.split('\n').slice(0, 12) : ['']

  function updateItem(index: number, nextValue: string) {
    const next = [...items]
    next[index] = nextValue.replaceAll('\n', ' ').slice(0, 200)
    onChange(next.join('\n').slice(0, 2000))
  }

  function removeItem(index: number) {
    const next = items.filter((_, itemIndex) => itemIndex !== index)
    onChange(next.join('\n'))
  }

  function addItem() {
    if (items.length < 12) onChange([...items, ''].join('\n'))
  }

  return (
    <div>
      <p className="text-base font-semibold tracking-[-0.01em]">
        {label}{hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            <input
              aria-label={`${label} – bod ${index + 1}`}
              value={item}
              maxLength={200}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={index === 0 ? placeholder : `Ďalší bod ${index + 1}`}
              className="min-w-0 flex-1 border-0 border-b border-border bg-transparent px-0 py-3 text-base text-foreground caret-foreground outline-none transition-colors placeholder:text-muted-foreground/55 focus:border-brand focus:ring-0"
            />
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={`Odstrániť bod ${index + 1}`}>
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {items.length < 12 && (
        <button type="button" onClick={addItem} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
          <Plus className="size-4" /> Pridať ďalší bod
        </button>
      )}
    </div>
  )
}

function ChoiceGrid({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string[]
  onChange: (value: string[]) => void
}) {
  function toggle(option: string) {
    onChange(selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option])
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const active = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option)}
            className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
              active ? 'bg-brand-soft text-foreground' : 'bg-white/70 text-foreground hover:bg-white'
            }`}
          >
            <span className={`grid size-5 shrink-0 place-items-center rounded-md border ${active ? 'border-brand bg-brand text-white' : 'border-border bg-transparent'}`}>
              {active && <Check className="size-3.5" aria-hidden="true" />}
            </span>
            {option}
          </button>
        )
      })}
    </div>
  )
}

function StepHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mb-9">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{text}</p>
    </div>
  )
}

async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null
  return data?.error || 'Niečo sa nepodarilo. Skúste to prosím znova.'
}

function CopyContactButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function copyContact() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const input = document.createElement('textarea')
      input.value = value
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }

    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={copyContact}
      className="inline-flex min-h-9 items-center gap-1.5 px-1 text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      aria-label={`Kopírovať ${value}`}
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      {copied ? 'Skopírované' : 'Kopírovať'}
    </button>
  )
}

export function OnboardingWizard({
  filesEmail,
  filesPhone,
  privacyPolicyUrl,
  token,
}: {
  filesEmail: string
  filesPhone: string
  privacyPolicyUrl?: string
  token: string
}) {
  const [answers, setAnswers] = useState<OnboardingAnswers>(emptyOnboardingAnswers)
  const [assets, setAssets] = useState<OnboardingAsset[]>([])
  const [step, setStep] = useState(1)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [loading, setLoading] = useState(true)
  const [fatalError, setFatalError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [reopenError, setReopenError] = useState('')
  const [completed, setCompleted] = useState(false)
  const hydratedRef = useRef(false)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const backupKey = `webkastart-onboarding-${token}`

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await fetch(`/api/onboarding/${token}`, { cache: 'no-store' })
        if (!response.ok) throw new Error(await responseError(response))
        const data = await response.json() as OnboardingProjectResponse
        if (cancelled) return

        let nextAnswers = data.answers
        let nextStep = data.currentStep
        const backup = localStorage.getItem(backupKey)
        if (backup) {
          try {
            const local = JSON.parse(backup) as { answers: OnboardingAnswers; currentStep: number; savedAt: string }
            if (new Date(local.savedAt) > new Date(data.updatedAt)) {
              nextAnswers = local.answers
              nextStep = local.currentStep
            }
          } catch {
            localStorage.removeItem(backupKey)
          }
        }

        setAnswers(nextAnswers)
        setAssets(data.assets)
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

  const queueSave = useCallback(function queueSave(nextAnswers: OnboardingAnswers, nextStep: number) {
    setSaveState('saving')
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch(`/api/onboarding/${token}`, {
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
    function retryWhenOnline() {
      if (hydratedRef.current && !completed) void queueSave(answers, step)
    }
    window.addEventListener('online', retryWhenOnline)
    return () => window.removeEventListener('online', retryWhenOnline)
  }, [answers, completed, queueSave, step])

  function goToStep(next: number) {
    setStep(Math.min(TOTAL_STEPS, Math.max(1, next)))
    setSubmitError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateStringList(key: 'inspirationUrls' | 'socialLinks', index: number, value: string) {
    setAnswers((current) => {
      const next = [...current[key]]
      while (next.length <= index) next.push('')
      next[index] = value
      return { ...current, [key]: next }
    })
  }

  async function submit() {
    const errors = validateContact(answers)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setSubmitError('Doplňte prosím dve označené kontaktné polia.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await saveQueueRef.current
      const response = await fetch(`/api/onboarding/${token}/submit`, {
        body: JSON.stringify({ answers }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(await responseError(response))
      localStorage.removeItem(backupKey)
      setCompleted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Podklady sa nepodarilo odoslať.')
    } finally {
      setSubmitting(false)
    }
  }

  async function reopenOnboarding() {
    setReopening(true)
    setReopenError('')
    try {
      const response = await fetch(`/api/onboarding/${token}`, {
        body: JSON.stringify({ answers, currentStep: step, reopen: true }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      if (!response.ok) throw new Error(await responseError(response))
      setCompleted(false)
      setSaveState('saved')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setReopenError(error instanceof Error ? error.message : 'Formulár sa nepodarilo znovu otvoriť.')
    } finally {
      setReopening(false)
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-brand" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground">Otvárame váš onboarding…</p>
        </div>
      </main>
    )
  }

  if (fatalError) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="max-w-md text-center">
          <LogoMark className="mx-auto" />
          <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">Tento odkaz nevieme otvoriť</h1>
          <p className="mt-3 leading-7 text-muted-foreground">{fatalError} Skontrolujte prosím celý odkaz alebo nám napíšte.</p>
        </div>
      </main>
    )
  }

  if (completed) {
    return (
      <main className="grid min-h-dvh place-items-center px-5 py-12">
        <div className="max-w-xl text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-brand">
            <PartyPopper className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-7 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Máme všetko, čo potrebujeme. 🎉</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Ďakujeme. Podklady si teraz prejdeme a pripravíme ďalší krok vášho webu. Ak ste na niečo zabudli, nič sa nedeje.
          </p>
          <button
            type="button"
            onClick={reopenOnboarding}
            disabled={reopening}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 disabled:cursor-wait disabled:opacity-60"
          >
            {reopening && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {reopening ? 'Otváram formulár…' : 'Znovu otvoriť a niečo doplniť'}
          </button>
          {reopenError && <p className="mt-4 text-sm text-destructive" role="alert">{reopenError}</p>}
        </div>
      </main>
    )
  }

  const filledSections = answers.sections.length
  const filesMailto = `mailto:${filesEmail}?subject=${encodeURIComponent('Podklady k novému webu')}`
  const whatsappNumber = filesPhone.replace(/\D/g, '').replace(/^0/, '421')
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Dobrý deň, posielam podklady k novému webu.')}`

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
        <div className="mb-10 sm:mb-14">
          <div className="flex items-end justify-between gap-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Poďme pripraviť váš web</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Stačí nám pár základných informácií. Nemusíte mať všetko premyslené ani pripravené. Ak pri niečom neviete odpovedať, pokojne otázku preskočte.
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">{step} z {TOTAL_STEPS}</p>
          </div>
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
            <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={step}>
          {step === 1 && (
            <>
              <StepHeader eyebrow="Krok 1" title="Najprv niečo o vás" text="Pár viet nám pomôže pochopiť, čo robíte. Nemusia byť dokonalé – texty spolu ešte doladíme." />
              <div className="space-y-9">
                <Field label="Ako sa voláte / názov podnikania" hint="Nepovinné" value={answers.client.displayName} maxLength={160} onChange={(e) => setAnswers({ ...answers, client: { displayName: e.target.value } })} placeholder="Napr. Jana Nováková / Ateliér Jana" />
                <Field label="Čomu sa venujete?" hint="Nepovinné" value={answers.business.area} maxLength={500} onChange={(e) => setAnswers({ ...answers, business: { ...answers.business, area: e.target.value }, services: e.target.value })} placeholder="Napr. svadobná a rodinná fotografka" />
                <TextArea label="Ako by ste jednoducho vysvetlili svoju prácu?" hint="Nepovinné" value={answers.business.description} maxLength={3000} onChange={(e) => setAnswers({ ...answers, business: { ...answers.business, description: e.target.value } })} placeholder="Som fotografka a fotím najmä svadby a rodinné fotenia." />
                <Field label="Máte už existujúci web?" hint="Nepovinné" type="url" inputMode="url" value={answers.existingWebsite} maxLength={500} onChange={(e) => setAnswers({ ...answers, existingWebsite: e.target.value })} placeholder="https://" />
                <div>
                  <Field label="Sociálne siete" hint="Nepovinné" type="url" inputMode="url" value={answers.socialLinks[0] || ''} maxLength={500} onChange={(e) => updateStringList('socialLinks', 0, e.target.value)} placeholder="Vložte odkaz na Instagram, Facebook alebo LinkedIn" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
                  {answers.socialLinks.slice(1).map((url, index) => (
                    <div key={index + 1} className="mt-3 flex items-end gap-3">
                      <Field aria-label={`Sociálna sieť ${index + 2}`} label={`Ďalší odkaz ${index + 2}`} value={url} type="url" className="flex-1" onChange={(e) => updateStringList('socialLinks', index + 1, e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
                      <button type="button" className="mb-2 grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Odstrániť odkaz" onClick={() => setAnswers({ ...answers, socialLinks: answers.socialLinks.filter((_, i) => i !== index + 1) })}><X className="size-4" /></button>
                    </div>
                  ))}
                  {answers.socialLinks.length < 5 && <button type="button" onClick={() => setAnswers((current) => ({ ...current, socialLinks: [...(current.socialLinks.length ? current.socialLinks : ['']), ''] }))} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"><Plus className="size-4" /> Pridať ďalší odkaz</button>}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader eyebrow="Krok 2" title="Vaši zákazníci a cieľ stránky" text="Stačí váš bežný pohľad. Nemusíte poznať marketingové poučky ani presné čísla." />
              <div className="space-y-10">
                <TextArea label="Komu najčastejšie pomáhate / kto sú vaši zákazníci?" hint="Nepovinné" value={answers.targetAudience} maxLength={2000} onChange={(e) => setAnswers({ ...answers, targetAudience: e.target.value })} placeholder="Napr. páry, ktoré plánujú menšiu svadbu na Slovensku." />
                <div><h3 className="text-base font-semibold">Čo by mal návštevník po príchode na web urobiť?</h3><OptionalHint /><div className="mt-4"><ChoiceGrid options={desiredActionOptions} selected={answers.desiredActions} onChange={(desiredActions) => setAnswers({ ...answers, desiredActions })} /></div></div>
                <TextArea label="Čo je najdôležitejšie, aby sa na stránke dozvedel?" hint="Nepovinné" value={answers.websiteGoal} maxLength={2000} onChange={(e) => setAnswers({ ...answers, websiteGoal: e.target.value })} placeholder="Napr. aké fotenia ponúkam a ako si rezervovať termín." />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader eyebrow="Krok 3" title="Čo chcete na stránke" text="Označte všetko, čo vám dáva zmysel. Ak si nie ste istí, pokojne nechajte návrh na nás." />
              <div className="space-y-10">
                <div><ChoiceGrid options={sectionOptions} selected={answers.sections} onChange={(sections) => setAnswers({ ...answers, sections })} /></div>
                <BulletListField label="Je ešte niečo, čo by ste na stránke chceli?" hint="Nepovinné" value={answers.otherSections} onChange={(otherSections) => setAnswers({ ...answers, otherSections })} placeholder="Napr. kalendár" />
                <div><h3 className="text-base font-semibold">Chceli by ste web neskôr rozširovať?</h3><OptionalHint>Nemusíte to mať ešte premyslené. Pomôže nám aj „zatiaľ neviem“.</OptionalHint><div className="mt-4"><ChoiceGrid options={futureOptions} selected={answers.futureFeatures} onChange={(futureFeatures) => setAnswers({ ...answers, futureFeatures })} /></div></div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <StepHeader eyebrow="Krok 4" title="Ako by mal web pôsobiť" text="Vyberte pár slov podľa pocitu. Zvyšok vám navrhneme tak, aby sedel vašej práci aj zákazníkom." />
              <div className="space-y-10">
                <div>
                  <h3 className="text-base font-semibold">Ako by mal váš web pôsobiť?</h3>
                  <OptionalHint />
                  <div className="mt-4"><ChoiceGrid options={designOptions} selected={answers.designPreferences} onChange={(designPreferences) => setAnswers({ ...answers, designPreferences })} /></div>
                  <div className="mt-6">
                    <Field label="Vlastnými slovami" hint="Nepovinné" value={answers.designOther || ''} maxLength={500} onChange={(event) => setAnswers({ ...answers, designOther: event.target.value })} placeholder="Napr. jemný, vzdušný a prirodzený" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Poznáte stránky, ktoré sa vám páčia? <span className="ml-2 text-xs font-normal text-muted-foreground">Nepovinné</span></h3>
                  <OptionalHint>Nemusíte vedieť vysvetliť prečo. Stačí nám ukázať, čo sa vám páči.</OptionalHint>
                  <div className="mt-3 space-y-3">
                    {answers.inspirationUrls.map((url, index) => (
                      <div key={index} className="flex items-end gap-3">
                        <Field aria-label={`Inšpirácia ${index + 1}`} label={`Odkaz ${index + 1}`} type="url" inputMode="url" value={url} maxLength={500} onChange={(e) => updateStringList('inspirationUrls', index, e.target.value)} placeholder="https://" />
                        {answers.inspirationUrls.length > 1 && <button type="button" className="mb-2 grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Odstrániť odkaz" onClick={() => setAnswers({ ...answers, inspirationUrls: answers.inspirationUrls.filter((_, i) => i !== index) })}><X className="size-4" /></button>}
                      </div>
                    ))}
                  </div>
                  {answers.inspirationUrls.length < 5 && <button type="button" onClick={() => setAnswers({ ...answers, inspirationUrls: [...answers.inspirationUrls, ''] })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"><Plus className="size-4" /> Pridať ďalší odkaz</button>}
                </div>
                <TextArea label="Je niečo, čo sa vám na weboch vyslovene nepáči?" hint="Nepovinné" value={answers.dislikes} maxLength={2000} onChange={(e) => setAnswers({ ...answers, dislikes: e.target.value })} placeholder="Ak nič také nemáte, nevadí." />
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <StepHeader eyebrow="Krok 5" title="Pošlite nám všetko, čo už máte" text="Nahrajte naraz fotografie, logo, PDF alebo ďalšie materiály. Súbory môžete doplniť aj neskôr cez rovnaký link." />
              <UploadField assets={assets} onAssetsChange={setAssets} token={token} />
              <div className="mt-10 max-w-xl border-t border-border/70 pt-7">
                <p className="mb-2 text-sm font-semibold">Ak vám nahrávanie nevyhovuje</p>
                <div className="divide-y divide-border/70">
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-0.5 inline-block text-base font-semibold text-foreground hover:text-brand hover:underline">
                      {filesPhone}
                    </a>
                  </div>
                  <CopyContactButton value={filesPhone} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <a href={filesMailto} className="mt-0.5 inline-block text-base font-semibold text-foreground hover:text-brand hover:underline">
                      {filesEmail}
                    </a>
                  </div>
                  <CopyContactButton value={filesEmail} />
                </div>
                </div>
              </div>
              <OptionalHint>Do správy napíšte svoje meno alebo názov projektu. Pri väčších súboroch nám môžete poslať odkaz z WeTransferu alebo Google Disku.</OptionalHint>
            </>
          )}

          {step === 6 && (
            <>
              <StepHeader eyebrow="Krok 6" title="Kontakt a dokončenie" text="Už len údaje, cez ktoré sa spojíme. Povinné sú iba meno a e-mail." />
              <div className="space-y-9">
                <Field label="Meno kontaktnej osoby" value={answers.contact.name} error={fieldErrors.name} maxLength={160} onChange={(e) => setAnswers({ ...answers, contact: { ...answers.contact, name: e.target.value } })} autoComplete="name" />
                <Field label="E-mail" type="email" inputMode="email" value={answers.contact.email} error={fieldErrors.email} maxLength={254} onChange={(e) => setAnswers({ ...answers, contact: { ...answers.contact, email: e.target.value } })} autoComplete="email" />
                <Field label="Telefón" hint="Nepovinné" type="tel" inputMode="tel" value={answers.contact.phone} maxLength={80} onChange={(e) => setAnswers({ ...answers, contact: { ...answers.contact, phone: e.target.value } })} autoComplete="tel" />
                <div><h3 className="text-base font-semibold">Ako vám najradšej napíšeme alebo zavoláme?</h3><OptionalHint /><div className="mt-4"><ChoiceGrid options={communicationOptions} selected={answers.contact.preferredMethod ? [answers.contact.preferredMethod] : []} onChange={(value) => setAnswers({ ...answers, contact: { ...answers.contact, preferredMethod: value.at(-1) || '' } })} /></div></div>
                <details className="group py-1">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:hidden"><span className="inline-flex items-center gap-2"><Plus className="size-4 transition-transform group-open:rotate-45" /> Pridať fakturačné údaje <span className="font-normal text-muted-foreground">(nepovinné)</span></span></summary>
                  <div className="mt-7 space-y-8 pl-6">
                    <Field label="Názov firmy" value={answers.billing.companyName} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, companyName: e.target.value } })} />
                    <div className="grid gap-8 sm:grid-cols-3"><Field label="IČO" value={answers.billing.companyId} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, companyId: e.target.value } })} /><Field label="DIČ" value={answers.billing.taxId} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, taxId: e.target.value } })} /><Field label="IČ DPH" value={answers.billing.vatId} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, vatId: e.target.value } })} /></div>
                    <TextArea label="Fakturačná adresa" value={answers.billing.address} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, address: e.target.value } })} />
                  </div>
                </details>
                <TextArea label="Je ešte niečo, čo by sme mali o projekte vedieť?" hint="Nepovinné" value={answers.additionalNotes} maxLength={5000} onChange={(e) => setAnswers({ ...answers, additionalNotes: e.target.value })} placeholder="Čokoľvek, čo sa nezmestilo do predchádzajúcich otázok." />

                <div className="bg-white/60 px-5 py-5 sm:px-6">
                  <h3 className="font-semibold">Krátke zhrnutie</h3>
                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <p><span className="block text-lg font-semibold text-foreground">{filledSections}</span> vybraných častí webu</p>
                    <p><span className="block text-lg font-semibold text-foreground">{answers.designPreferences.length + (answers.designOther ? 1 : 0)}</span> slov pre vizuálny smer</p>
                    <p><span className="block text-lg font-semibold text-foreground">E-mail</span> samostatné podklady</p>
                  </div>
                </div>
                {privacyPolicyUrl && <p className="text-xs leading-5 text-muted-foreground">Odoslaním nám poskytujete údaje na prípravu vášho webu. <a href={privacyPolicyUrl} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className="underline underline-offset-2 hover:text-foreground">Ochrana osobných údajov</a></p>}
                {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
              </div>
            </>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <button type="button" onClick={() => goToStep(step - 1)} disabled={step === 1} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:invisible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><ArrowLeft className="size-4" /> Späť</button>
          {step < TOTAL_STEPS ? (
            <div className="flex items-center gap-2">
              {step === 5 && <button type="button" onClick={() => goToStep(step + 1)} className="hidden min-h-11 px-3 text-sm font-semibold text-muted-foreground hover:text-foreground sm:inline-flex sm:items-center">Preskočiť</button>}
              <button type="button" onClick={() => goToStep(step + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">Pokračovať <ArrowRight className="size-4" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => void submit()} disabled={submitting} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">{submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Odoslať podklady</button>
          )}
        </div>
      </div>
    </main>
  )
}
