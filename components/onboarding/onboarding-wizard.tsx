'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Cloud, CloudOff, Copy, Loader2, PartyPopper, Plus, X } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { OtherAnswer, QuickQuestion, RepeatableTextItems } from '@/components/onboarding/quick-fields'
import { RepresentativePhotoPicker } from '@/components/onboarding/representative-photo-picker'
import { UploadField } from '@/components/onboarding/upload-field'
import {
  emptyOnboardingAnswers,
  type OnboardingAnswers,
  type OnboardingAsset,
  type OnboardingProjectResponse,
} from '@/lib/onboarding/types'
import { sanitizeAnswers, validateContact } from '@/lib/onboarding/validation'
import {
  brandFeelingOptions, colorOptions, communicationOptions, desiredActionOptions, dislikeOptions,
  futureOptions, includeSavedOptions, offeringOptions, sectionOptions, socialPlatformOptions,
  projectTypeOptions, targetAudienceOptions, websiteExpectationOptions, websiteInformationOptions,
} from '@/lib/onboarding/options'
import { isUnconfirmedPrefill, markClientFieldChange } from '@/lib/onboarding/prefill'
import type { PrefillFieldKey } from '@/lib/onboarding/types'

const TOTAL_STEPS = 6

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

function ChoiceGrid({
  options,
  selected,
  onChange,
}: {
  options: readonly string[]
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
  const revisionRef = useRef(1)
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
              nextAnswers = sanitizeAnswers(local.answers)
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
        revisionRef.current = data.revision
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
          body: JSON.stringify({ answers: nextAnswers, currentStep: nextStep, revision: revisionRef.current }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!response.ok) throw new Error(await responseError(response))
        const saved = await response.json() as { revision: number }
        revisionRef.current = saved.revision
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
      const updated = { ...current, [key]: next }
      return key === 'socialLinks' ? markClientFieldChange(updated, 'socialLinks') : updated
    })
  }

  function updateClientField(next: OnboardingAnswers, key: PrefillFieldKey) {
    setAnswers(markClientFieldChange(next, key))
  }

  function prefilledHint(key: PrefillFieldKey, fallback = 'Nepovinné') {
    return isUnconfirmedPrefill(answers, key)
      ? 'Predvyplnené z predchádzajúcej komunikácie'
      : fallback
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
        body: JSON.stringify({ answers, revision: revisionRef.current }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(await responseError(response))
      const saved = await response.json() as { revision: number }
      revisionRef.current = saved.revision
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
        body: JSON.stringify({ answers, currentStep: step, reopen: true, revision: revisionRef.current }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      if (!response.ok) throw new Error(await responseError(response))
      const saved = await response.json() as { revision: number }
      revisionRef.current = saved.revision
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
                <Field label="Ako sa voláte / názov podnikania" hint={prefilledHint('client.displayName')} value={answers.client.displayName} maxLength={160} onChange={(e) => updateClientField({ ...answers, client: { displayName: e.target.value } }, 'client.displayName')} placeholder="Napr. Jana Nováková / Ateliér Jana" />
                <Field label="Čomu sa venujete?" hint={prefilledHint('business.area')} value={answers.business.area} maxLength={500} onChange={(e) => updateClientField({ ...answers, business: { ...answers.business, area: e.target.value } }, 'business.area')} placeholder="Napr. cykloservis, účtovníctvo, handmade výroba, stavebné práce…" />
                <label className="block"><span className="text-base font-semibold tracking-[-0.01em]">Typ projektu / čo potrebujete</span><span className="ml-2 text-xs font-normal text-muted-foreground">{prefilledHint('projectType')}</span><select value={answers.projectType} onChange={(event) => updateClientField({ ...answers, projectType: event.target.value }, 'projectType')} className="mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none focus:border-brand"><option value="">Vyberte, ak už viete</option>{projectTypeOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <TextArea label="Ako by ste jednoducho opísali, čo robíte?" hint="Nepovinné" value={answers.business.description} maxLength={3000} onChange={(e) => setAnswers({ ...answers, business: { ...answers.business, description: e.target.value } })} placeholder="Nemusí to byť marketingový text. Napíšte to pokojne vlastnými slovami." />
                <TextArea label="Je za vašou značkou nejaký osobný príbeh, ktorý by mal zákazník poznať?" hint="Nepovinné" value={answers.brandStory} maxLength={5000} onChange={(e) => setAnswers({ ...answers, brandStory: e.target.value })} />
                <Field label="Máte už existujúci web?" hint={prefilledHint('existingWebsite')} type="url" inputMode="url" value={answers.existingWebsite} maxLength={500} onChange={(e) => updateClientField({ ...answers, existingWebsite: e.target.value }, 'existingWebsite')} placeholder="https://" />
                <div>
                  <p className="text-base font-semibold tracking-[-0.01em]">Sociálne siete <span className="ml-2 text-xs font-normal text-muted-foreground">{prefilledHint('socialLinks')}</span></p>
                  <div className="mt-3 space-y-3">
                    {(answers.socialLinks.length ? answers.socialLinks : ['']).map((url, index) => (
                      <div key={index} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3">
                        <select
                          aria-label={`Platforma sociálnej siete ${index + 1}`}
                          value={answers.socialPlatforms[index] || ''}
                          onChange={(event) => setAnswers((current) => {
                            const socialPlatforms = [...current.socialPlatforms]
                            while (socialPlatforms.length <= index) socialPlatforms.push('')
                            socialPlatforms[index] = event.target.value
                            return markClientFieldChange({ ...current, socialPlatforms }, 'socialLinks')
                          })}
                          className="w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm outline-none focus:border-brand"
                        >
                          <option value="">Platforma</option>
                          {socialPlatformOptions.map((option) => <option key={option}>{option}</option>)}
                        </select>
                        <input aria-label={`Odkaz na sociálnu sieť ${index + 1}`} type="url" inputMode="url" value={url} maxLength={500} onChange={(event) => updateStringList('socialLinks', index, event.target.value)} placeholder="https://" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="min-w-0 border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none placeholder:text-muted-foreground/55 focus:border-brand" />
                        {answers.socialLinks.length > 1 && <button type="button" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Odstrániť sociálnu sieť" onClick={() => updateClientField({ ...answers, socialLinks: answers.socialLinks.filter((_, itemIndex) => itemIndex !== index), socialPlatforms: answers.socialPlatforms.filter((_, itemIndex) => itemIndex !== index) }, 'socialLinks')}><X className="size-4" /></button>}
                      </div>
                    ))}
                  </div>
                  {answers.socialLinks.length < 8 && <button type="button" onClick={() => setAnswers((current) => markClientFieldChange({ ...current, socialLinks: [...(current.socialLinks.length ? current.socialLinks : ['']), ''], socialPlatforms: [...(current.socialPlatforms.length ? current.socialPlatforms : ['']), ''] }, 'socialLinks'))} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"><Plus className="size-4" /> Pridať sociálnu sieť</button>}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader eyebrow="Krok 2" title="Vaši zákazníci a cieľ stránky" text="Stačí váš bežný pohľad. Nemusíte poznať marketingové poučky ani presné čísla." />
              <div className="space-y-10">
                <QuickQuestion title="Kto sú vaši najčastejší zákazníci?">
                  <ChoiceGrid options={targetAudienceOptions} selected={answers.targetAudienceSelections} onChange={(targetAudienceSelections) => setAnswers({ ...answers, targetAudienceSelections })} />
                  <OtherAnswer show={answers.targetAudienceSelections.includes('Iné')} multiline label="Popíšte svojich zákazníkov" value={answers.targetAudience} onChange={(targetAudience) => setAnswers({ ...answers, targetAudience })} />
                </QuickQuestion>
                <QuickQuestion title={`Čo od nového webu očakávate?${isUnconfirmedPrefill(answers, 'websiteExpectations') ? ' · Predvyplnené z predchádzajúcej komunikácie' : ''}`}>
                  <ChoiceGrid options={websiteExpectationOptions} selected={answers.websiteExpectations} onChange={(websiteExpectations) => updateClientField({ ...answers, websiteExpectations }, 'websiteExpectations')} />
                  <OtherAnswer show={answers.websiteExpectations.includes('Iné')} label="Iné očakávanie" value={answers.websiteExpectationsOther} onChange={(websiteExpectationsOther) => setAnswers({ ...answers, websiteExpectationsOther })} />
                </QuickQuestion>
                <QuickQuestion title="Čo sa má návštevník na stránke hlavne dozvedieť?">
                  <ChoiceGrid options={websiteInformationOptions} selected={answers.websiteInformation} onChange={(websiteInformation) => setAnswers({ ...answers, websiteInformation })} />
                  <OtherAnswer show={answers.websiteInformation.includes('Iné')} multiline label="Iná dôležitá informácia" value={answers.websiteGoal} onChange={(websiteGoal) => setAnswers({ ...answers, websiteGoal })} />
                </QuickQuestion>
                <QuickQuestion title="Čo má návštevník urobiť?">
                  <ChoiceGrid options={desiredActionOptions} selected={answers.desiredActions} onChange={(desiredActions) => setAnswers({ ...answers, desiredActions })} />
                  <OtherAnswer show={answers.desiredActions.includes('Iné')} label="Iná akcia" value={answers.desiredActionsOther} onChange={(desiredActionsOther) => setAnswers({ ...answers, desiredActionsOther })} />
                </QuickQuestion>
                <QuickQuestion title="Čo ponúkate?">
                  <ChoiceGrid options={offeringOptions} selected={answers.offeringTypes} onChange={(offeringTypes) => setAnswers({ ...answers, offeringTypes })} />
                  <OtherAnswer show={answers.offeringTypes.includes('Iné')} label="Iný typ ponuky" value={answers.services} onChange={(services) => setAnswers({ ...answers, services })} />
                  <div className="mt-6"><RepeatableTextItems label="Konkrétne produkty alebo služby" addLabel="Pridať konkrétny produkt alebo službu" placeholder="Napr. servis bicykla" values={answers.offerItems} onChange={(offerItems) => setAnswers({ ...answers, offerItems })} /></div>
                </QuickQuestion>
                <TextArea label="Čo je na vašej ponuke najviac jedinečné?" hint="Čo je na vašich produktoch alebo službách také, čo zákazník inde bežne nenájde?" value={answers.uniqueOffering} maxLength={3000} onChange={(event) => setAnswers({ ...answers, uniqueOffering: event.target.value })} />
                <TextArea label="Ak by si návštevník po odchode zo stránky zapamätal iba jednu vec o vás alebo vašej ponuke, čo by to malo byť?" hint="Nepovinné" value={answers.keyTakeaway} maxLength={3000} onChange={(event) => setAnswers({ ...answers, keyTakeaway: event.target.value })} />
                <TextArea label="Čo by ste návštevníkovi ukázali ako prvé, keby ste mali iba 10 sekúnd?" hint="Nepovinné" value={answers.tenSecondHighlight} maxLength={3000} onChange={(event) => setAnswers({ ...answers, tenSecondHighlight: event.target.value })} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader eyebrow="Krok 3" title="Čo chcete na stránke" text="Označte všetko, čo vám dáva zmysel. Ak si nie ste istí, pokojne nechajte návrh na nás." />
              <div className="space-y-10">
                <QuickQuestion title="Čo by ste chceli na stránke?">
                  <ChoiceGrid options={sectionOptions} selected={answers.sections} onChange={(sections) => setAnswers({ ...answers, sections })} />
                  <OtherAnswer show={answers.sections.includes('Iné')} label="Iná časť stránky" value={answers.sectionsOther} onChange={(sectionsOther) => setAnswers({ ...answers, sectionsOther })} />
                </QuickQuestion>
                <QuickQuestion title="Plánujete web v budúcnosti rozšíriť?" hint="Nemusíte to mať ešte premyslené. Pomôže nám aj „zatiaľ neviem“." >
                  <ChoiceGrid options={futureOptions} selected={answers.futureFeatures} onChange={(futureFeatures) => setAnswers({ ...answers, futureFeatures })} />
                  <OtherAnswer show={answers.futureFeatures.includes('Iné')} label="Iné plánované rozšírenie" value={answers.futureFeaturesOther} onChange={(futureFeaturesOther) => setAnswers({ ...answers, futureFeaturesOther })} />
                </QuickQuestion>
                <TextArea label="Je ešte niečo, čo chcete na stránke?" hint="Nepovinné" value={answers.otherSections} maxLength={2000} onChange={(event) => setAnswers({ ...answers, otherSections: event.target.value })} placeholder="Čokoľvek, čo sa nezmestilo vyššie." />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <StepHeader eyebrow="Krok 4" title="Ako by mal web pôsobiť" text="Vyberte pár slov podľa pocitu. Zvyšok vám navrhneme tak, aby sedel vašej práci aj zákazníkom." />
              <div className="space-y-10">
                <QuickQuestion title="Aký pocit chcete, aby mal človek pri návšteve vašej stránky?">
                  <ChoiceGrid options={includeSavedOptions(brandFeelingOptions, answers.designPreferences)} selected={answers.designPreferences} onChange={(designPreferences) => setAnswers({ ...answers, designPreferences })} />
                  <OtherAnswer show={answers.designPreferences.includes('Iné')} label="Iný pocit" value={answers.designOther} onChange={(designOther) => setAnswers({ ...answers, designOther })} placeholder="Napr. bezpečie alebo energia" />
                </QuickQuestion>
                <QuickQuestion title="Aké farby vám sú blízke?" hint="Je to iba vaša preferencia, nie záväzná farebná paleta.">
                  <ChoiceGrid options={colorOptions} selected={answers.colorPreferences} onChange={(colorPreferences) => setAnswers({ ...answers, colorPreferences })} />
                  <OtherAnswer show={answers.colorPreferences.includes('Iné')} label="Iná farebná preferencia" value={answers.colorPreferencesOther} onChange={(colorPreferencesOther) => setAnswers({ ...answers, colorPreferencesOther })} />
                </QuickQuestion>
                <QuickQuestion title="Čomu sa má dizajn vyhnúť?">
                  <ChoiceGrid options={dislikeOptions} selected={answers.designDislikes} onChange={(designDislikes) => setAnswers({ ...answers, designDislikes })} />
                  <OtherAnswer show={answers.designDislikes.includes('Iné')} multiline label="Iné obmedzenie" value={answers.dislikes} onChange={(dislikes) => setAnswers({ ...answers, dislikes })} />
                </QuickQuestion>
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
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <StepHeader eyebrow="Krok 5" title="Fotografie a materiály" text="Nahrajte všetko, čo by mohlo byť pri tvorbe webu užitočné. Nemusíte vyberať iba najlepšie fotografie. Vhodné podklady vyberieme pri príprave webu." />
              <UploadField assets={assets} getAssetUrl={(asset) => `/api/onboarding/${token}/uploads/${asset.id}`} onAssetsChange={setAssets} token={token} />
              <div className="mt-10 border-t border-border/70 pt-8">
                <RepresentativePhotoPicker assets={assets} getAssetUrl={(asset) => `/api/onboarding/${token}/uploads/${asset.id}`} selected={answers.representativePhotoIds} onChange={(representativePhotoIds) => setAnswers({ ...answers, representativePhotoIds })} />
              </div>
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
                <Field label="Meno kontaktnej osoby" hint={prefilledHint('contact.name', '')} value={answers.contact.name} error={fieldErrors.name} maxLength={160} onChange={(e) => updateClientField({ ...answers, contact: { ...answers.contact, name: e.target.value } }, 'contact.name')} autoComplete="name" />
                <Field label="E-mail" hint={prefilledHint('contact.email', '')} type="email" inputMode="email" value={answers.contact.email} error={fieldErrors.email} maxLength={254} onChange={(e) => updateClientField({ ...answers, contact: { ...answers.contact, email: e.target.value } }, 'contact.email')} autoComplete="email" />
                <Field label="Telefón" hint={prefilledHint('contact.phone')} type="tel" inputMode="tel" value={answers.contact.phone} maxLength={80} onChange={(e) => updateClientField({ ...answers, contact: { ...answers.contact, phone: e.target.value } }, 'contact.phone')} autoComplete="tel" />
                <QuickQuestion title={`Ako vás má zákazník ideálne kontaktovať?${isUnconfirmedPrefill(answers, 'contact.preferredMethods') ? ' · Predvyplnené z predchádzajúcej komunikácie' : ''}`}>
                  <ChoiceGrid options={communicationOptions} selected={answers.contact.preferredMethods} onChange={(preferredMethods) => updateClientField({ ...answers, contact: { ...answers.contact, preferredMethods } }, 'contact.preferredMethods')} />
                  <OtherAnswer show={answers.contact.preferredMethods.includes('Iné')} label="Iný spôsob kontaktu" value={answers.contact.preferredMethod} onChange={(preferredMethod) => setAnswers({ ...answers, contact: { ...answers.contact, preferredMethod } })} />
                </QuickQuestion>
                <details className="group py-1">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:hidden"><span className="inline-flex items-center gap-2"><Plus className="size-4 transition-transform group-open:rotate-45" /> Pridať fakturačné údaje <span className="font-normal text-muted-foreground">(nepovinné)</span></span></summary>
                  <div className="mt-7 space-y-8 pl-6">
                    <Field label="Názov firmy" value={answers.billing.companyName} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, companyName: e.target.value } })} />
                    <div className="grid gap-8 sm:grid-cols-3"><Field label="IČO" value={answers.billing.companyId} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, companyId: e.target.value } })} /><Field label="DIČ" value={answers.billing.taxId} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, taxId: e.target.value } })} /><Field label="IČ DPH" value={answers.billing.vatId} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, vatId: e.target.value } })} /></div>
                    <TextArea label="Fakturačná adresa" value={answers.billing.address} onChange={(e) => setAnswers({ ...answers, billing: { ...answers.billing, address: e.target.value } })} />
                  </div>
                </details>
                <TextArea label="Je ešte niečo, čo by sme mali o projekte vedieť?" hint={prefilledHint('additionalNotes')} value={answers.additionalNotes} maxLength={5000} onChange={(e) => updateClientField({ ...answers, additionalNotes: e.target.value }, 'additionalNotes')} placeholder="Čokoľvek, čo sa nezmestilo do predchádzajúcich otázok." />

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
