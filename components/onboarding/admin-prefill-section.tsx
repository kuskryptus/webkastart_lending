'use client'

import { Loader2, Plus, Save, X } from 'lucide-react'
import { communicationOptions, projectTypeOptions, socialPlatformOptions, websiteExpectationOptions } from '@/lib/onboarding/options'
import type { OnboardingAnswers, PrefillFieldKey } from '@/lib/onboarding/types'

function Input({ label, onChange, type = 'text', value }: {
  label: string
  onChange: (value: string) => void
  type?: React.HTMLInputTypeAttribute
  value: string
}) {
  return <label className="block"><span className="text-xs font-semibold text-muted-foreground">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand" /></label>
}

function Select({ label, onChange, options, value }: {
  label: string
  onChange: (value: string) => void
  options: readonly string[]
  value: string
}) {
  return <label className="block"><span className="text-xs font-semibold text-muted-foreground">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand"><option value="">Nevyplnené</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

export function AdminPrefillSection({
  answers,
  dirty,
  message,
  onChange,
  onSave,
  saving,
}: {
  answers: OnboardingAnswers
  dirty: boolean
  message: string
  onChange: (answers: OnboardingAnswers, field: PrefillFieldKey) => void
  onSave: () => void
  saving: boolean
}) {
  const links = answers.socialLinks.length ? answers.socialLinks : ['']

  return (
    <section className="border-b border-border pb-12 sm:pb-16">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Admin prefill</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">Informácie, ktoré viem doplniť ja</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Vyplňte údaje, ktoré už o klientovi poznáte. Klient ich potom nebude musieť zadávať znova.</p>

      <div className="mt-8 grid gap-7 sm:grid-cols-2">
        <Input label="Meno / názov podnikania" value={answers.client.displayName} onChange={(displayName) => onChange({ ...answers, client: { displayName } }, 'client.displayName')} />
        <Input label="Kontaktná osoba" value={answers.contact.name} onChange={(name) => onChange({ ...answers, contact: { ...answers.contact, name } }, 'contact.name')} />
        <Input label="E-mail" type="email" value={answers.contact.email} onChange={(email) => onChange({ ...answers, contact: { ...answers.contact, email } }, 'contact.email')} />
        <Input label="Telefón" type="tel" value={answers.contact.phone} onChange={(phone) => onChange({ ...answers, contact: { ...answers.contact, phone } }, 'contact.phone')} />
        <Input label="Existujúci web" type="url" value={answers.existingWebsite} onChange={(existingWebsite) => onChange({ ...answers, existingWebsite }, 'existingWebsite')} />
        <Input label="Čomu sa klient venuje" value={answers.business.area} onChange={(area) => onChange({ ...answers, business: { ...answers.business, area } }, 'business.area')} />
        <Select label="Typ projektu / čo klient potrebuje" options={projectTypeOptions} value={answers.projectType} onChange={(projectType) => onChange({ ...answers, projectType }, 'projectType')} />
        <Select label="Preferovaný spôsob kontaktu" options={communicationOptions} value={answers.contact.preferredMethods[0] || ''} onChange={(preferredMethod) => onChange({ ...answers, contact: { ...answers.contact, preferredMethods: preferredMethod ? [preferredMethod] : [] } }, 'contact.preferredMethods')} />
        <div className="sm:col-span-2"><Select label="Základný cieľ webu, ak ho poznáte" options={websiteExpectationOptions} value={answers.websiteExpectations[0] || ''} onChange={(expectation) => onChange({ ...answers, websiteExpectations: expectation ? [expectation] : [] }, 'websiteExpectations')} /></div>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-muted-foreground">Sociálne siete</p>
          <div className="mt-2 space-y-3">
            {links.map((url, index) => (
              <div key={index} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3">
                <select aria-label={`Platforma ${index + 1}`} value={answers.socialPlatforms[index] || ''} onChange={(event) => { const socialPlatforms = [...answers.socialPlatforms]; while (socialPlatforms.length <= index) socialPlatforms.push(''); socialPlatforms[index] = event.target.value; onChange({ ...answers, socialPlatforms }, 'socialLinks') }} className="border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand"><option value="">Platforma</option>{socialPlatformOptions.map((option) => <option key={option}>{option}</option>)}</select>
                <input aria-label={`Odkaz ${index + 1}`} type="url" value={url} onChange={(event) => { const socialLinks = [...links]; socialLinks[index] = event.target.value; onChange({ ...answers, socialLinks }, 'socialLinks') }} placeholder="https://" className="min-w-0 border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand" />
                {links.length > 1 && <button type="button" onClick={() => onChange({ ...answers, socialLinks: links.filter((_, itemIndex) => itemIndex !== index), socialPlatforms: answers.socialPlatforms.filter((_, itemIndex) => itemIndex !== index) }, 'socialLinks')} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary" aria-label={`Odstrániť sociálnu sieť ${index + 1}`}><X className="size-4" /></button>}
              </div>
            ))}
          </div>
          {links.length < 8 && <button type="button" onClick={() => onChange({ ...answers, socialLinks: [...links, ''], socialPlatforms: [...answers.socialPlatforms, ''] }, 'socialLinks')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"><Plus className="size-4" /> Pridať sociálnu sieť</button>}
        </div>

        <label className="block sm:col-span-2"><span className="text-xs font-semibold text-muted-foreground">Poznámka z prvého kontaktu</span><textarea value={answers.additionalNotes} onChange={(event) => onChange({ ...answers, additionalNotes: event.target.value }, 'additionalNotes')} className="mt-2 min-h-24 w-full resize-y border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm leading-6 outline-none focus:border-brand" /></label>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
        <span className={`text-xs ${message.includes('medzitým') || message.includes('nepodarilo') ? 'text-destructive' : 'text-muted-foreground'}`}>{message}</span>
        <button type="button" onClick={onSave} disabled={saving || !dirty} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Uložiť predvyplnené údaje</button>
      </div>
    </section>
  )
}
