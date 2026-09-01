'use client'

import type { Discovery2Answers, OnboardingAnswers } from '@/lib/onboarding/types'

function Field({
  disabled,
  label,
  multiline = false,
  onChange,
  value,
}: {
  disabled?: boolean
  label: string
  multiline?: boolean
  onChange: (value: string) => void
  value: string
}) {
  const className = 'mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm leading-6 outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-70'
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className={`${className} min-h-24 resize-y`} />
      ) : (
        <input disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
    </label>
  )
}

function ListField({ disabled, label, onChange, value }: {
  disabled?: boolean
  label: string
  onChange: (value: string[]) => void
  value: string[]
}) {
  return <Field disabled={disabled} label={`${label} (jeden údaj na riadok)`} multiline value={value.join('\n')} onChange={(next) => onChange(next.split('\n'))} />
}

function Group({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <fieldset className="border-t border-border/70 pt-7 first:border-0 first:pt-0">
      <legend className="mb-6 text-base font-semibold tracking-[-0.02em]">{title}</legend>
      <div className="grid gap-7 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

export function CoreWorkspaceFields({ answers, disabled, onChange }: {
  answers: OnboardingAnswers
  disabled?: boolean
  onChange: (answers: OnboardingAnswers) => void
}) {
  return (
    <div className="space-y-10">
      <Group title="O vás a vašom podnikaní">
        <Field disabled={disabled} label="Meno / názov podnikania" value={answers.client.displayName} onChange={(displayName) => onChange({ ...answers, client: { displayName } })} />
        <Field disabled={disabled} label="Čomu sa venujete" value={answers.business.area} onChange={(area) => onChange({ ...answers, business: { ...answers.business, area } })} />
        <div className="sm:col-span-2"><Field disabled={disabled} multiline label="Ako by ste opísali svoju prácu" value={answers.business.description} onChange={(description) => onChange({ ...answers, business: { ...answers.business, description } })} /></div>
        <Field disabled={disabled} label="Existujúci web" value={answers.existingWebsite} onChange={(existingWebsite) => onChange({ ...answers, existingWebsite })} />
        <ListField disabled={disabled} label="Sociálne siete" value={answers.socialLinks} onChange={(socialLinks) => onChange({ ...answers, socialLinks })} />
      </Group>
      <Group title="Zákazníci a cieľ webu">
        <Field disabled={disabled} multiline label="Komu najčastejšie pomáhate" value={answers.targetAudience} onChange={(targetAudience) => onChange({ ...answers, targetAudience })} />
        <Field disabled={disabled} multiline label="Čo sa má návštevník dozvedieť" value={answers.websiteGoal} onChange={(websiteGoal) => onChange({ ...answers, websiteGoal })} />
        <ListField disabled={disabled} label="Čo má návštevník urobiť" value={answers.desiredActions} onChange={(desiredActions) => onChange({ ...answers, desiredActions })} />
        <Field disabled={disabled} multiline label="Služby / ponuka" value={answers.services} onChange={(services) => onChange({ ...answers, services })} />
      </Group>
      <Group title="Obsah stránky">
        <ListField disabled={disabled} label="Časti stránky" value={answers.sections} onChange={(sections) => onChange({ ...answers, sections })} />
        <ListField disabled={disabled} label="Budúce rozšírenia" value={answers.futureFeatures} onChange={(futureFeatures) => onChange({ ...answers, futureFeatures })} />
        <div className="sm:col-span-2"><Field disabled={disabled} multiline label="Ďalšie požiadavky" value={answers.otherSections} onChange={(otherSections) => onChange({ ...answers, otherSections })} /></div>
      </Group>
      <Group title="Vizuálny smer">
        <ListField disabled={disabled} label="Ako má web pôsobiť" value={answers.designPreferences} onChange={(designPreferences) => onChange({ ...answers, designPreferences })} />
        <Field disabled={disabled} label="Ďalší vizuálny smer" value={answers.designOther} onChange={(designOther) => onChange({ ...answers, designOther })} />
        <ListField disabled={disabled} label="Inšpirácie" value={answers.inspirationUrls} onChange={(inspirationUrls) => onChange({ ...answers, inspirationUrls })} />
        <Field disabled={disabled} multiline label="Čomu sa vyhnúť" value={answers.dislikes} onChange={(dislikes) => onChange({ ...answers, dislikes })} />
      </Group>
      <Group title="Kontakt a fakturácia">
        <Field disabled={disabled} label="Kontaktná osoba" value={answers.contact.name} onChange={(name) => onChange({ ...answers, contact: { ...answers.contact, name } })} />
        <Field disabled={disabled} label="E-mail" value={answers.contact.email} onChange={(email) => onChange({ ...answers, contact: { ...answers.contact, email } })} />
        <Field disabled={disabled} label="Telefón" value={answers.contact.phone} onChange={(phone) => onChange({ ...answers, contact: { ...answers.contact, phone } })} />
        <Field disabled={disabled} label="Preferovaný kontakt" value={answers.contact.preferredMethod} onChange={(preferredMethod) => onChange({ ...answers, contact: { ...answers.contact, preferredMethod } })} />
        <Field disabled={disabled} label="Fakturačný názov" value={answers.billing.companyName} onChange={(companyName) => onChange({ ...answers, billing: { ...answers.billing, companyName } })} />
        <Field disabled={disabled} label="IČO" value={answers.billing.companyId} onChange={(companyId) => onChange({ ...answers, billing: { ...answers.billing, companyId } })} />
        <Field disabled={disabled} label="DIČ" value={answers.billing.taxId} onChange={(taxId) => onChange({ ...answers, billing: { ...answers.billing, taxId } })} />
        <Field disabled={disabled} label="IČ DPH" value={answers.billing.vatId} onChange={(vatId) => onChange({ ...answers, billing: { ...answers.billing, vatId } })} />
        <div className="sm:col-span-2"><Field disabled={disabled} multiline label="Fakturačná adresa" value={answers.billing.address} onChange={(address) => onChange({ ...answers, billing: { ...answers.billing, address } })} /></div>
        <div className="sm:col-span-2"><Field disabled={disabled} multiline label="Ďalšie poznámky" value={answers.additionalNotes} onChange={(additionalNotes) => onChange({ ...answers, additionalNotes })} /></div>
      </Group>
    </div>
  )
}

const discoveryQuestions: Array<[keyof Discovery2Answers, string]> = [
  ['order_process', 'Ako dnes zákazník objednáva a ako celý proces prebieha?'],
  ['primary_products_and_prices', 'Aké produkty chcete primárne ponúkať a v akých cenách?'],
  ['personalization_options', 'Čo všetko môže zákazník personalizovať?'],
  ['customer_appreciation', 'Čo zákazníci na vašej tvorbe najviac oceňujú?'],
  ['must_show_on_website', 'Čo chcete na novom webe určite ukázať?'],
]

export function DiscoveryWorkspaceFields({ answers, disabled, onChange }: {
  answers: Discovery2Answers
  disabled?: boolean
  onChange: (answers: Discovery2Answers) => void
}) {
  return (
    <div className="space-y-8">
      {discoveryQuestions.map(([key, label], index) => (
        <div key={key} className="border-t border-border/70 pt-7 first:border-0 first:pt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Otázka {index + 1}</p>
          <Field disabled={disabled} multiline label={label} value={answers[key]} onChange={(value) => onChange({ ...answers, [key]: value })} />
        </div>
      ))}
    </div>
  )
}
