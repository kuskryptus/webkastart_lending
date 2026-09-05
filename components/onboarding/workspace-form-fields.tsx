'use client'

import { Plus, X } from 'lucide-react'
import { ChoiceGrid, OtherAnswer, ProductPriceList, RepeatableTextItems } from '@/components/onboarding/quick-fields'
import { RepresentativePhotoPicker } from '@/components/onboarding/representative-photo-picker'
import {
  appreciationOptions, brandFeelingOptions, colorOptions, communicationOptions, desiredActionOptions,
  dislikeOptions, frequentQuestionOptions, futureOptions, mustShowOptions, offeringOptions,
  includeSavedOptions, orderOptions, personalizationOptions, sectionOptions, targetAudienceOptions,
  projectTypeOptions, socialPlatformOptions, websiteExpectationOptions, websiteInformationOptions,
} from '@/lib/onboarding/options'
import { isUnconfirmedPrefill, markClientFieldChange } from '@/lib/onboarding/prefill'
import type { Discovery2Answers, OnboardingAnswers, OnboardingAsset, PrefillFieldKey } from '@/lib/onboarding/types'

function Field({ hint, label, multiline = false, onChange, value }: {
  hint?: string
  label: string
  multiline?: boolean
  onChange: (value: string) => void
  value: string
}) {
  const className = 'mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm leading-6 outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-70'
  return <label className="block"><span className="text-xs font-semibold text-muted-foreground">{label}</span>{hint && <span className="mt-1 block text-xs text-brand/80">{hint}</span>}{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${className} min-h-24 resize-y`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={className} />}</label>
}

function SelectField({ hint, label, onChange, options, value }: { hint?: string; label: string; onChange: (value: string) => void; options: readonly string[]; value: string }) {
  return <label className="block"><span className="text-xs font-semibold text-muted-foreground">{label}</span>{hint && <span className="mt-1 block text-xs text-brand/80">{hint}</span>}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand"><option value="">Nevyplnené</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function ListField({ label, onChange, value }: { label: string; onChange: (value: string[]) => void; value: string[] }) {
  return <Field label={`${label} (jeden údaj na riadok)`} multiline value={value.join('\n')} onChange={(next) => onChange(next.split('\n'))} />
}

function SocialLinksField({ answers, hint, onChange }: { answers: OnboardingAnswers; hint?: string; onChange: (answers: OnboardingAnswers) => void }) {
  const links = answers.socialLinks.length ? answers.socialLinks : ['']
  return <div className="sm:col-span-2"><p className="text-xs font-semibold text-muted-foreground">Sociálne siete</p>{hint && <p className="mt-1 text-xs text-brand/80">{hint}</p>}<div className="mt-2 space-y-3">{links.map((url, index) => <div key={index} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3"><select aria-label={`Platforma ${index + 1}`} value={answers.socialPlatforms[index] || ''} onChange={(event) => { const socialPlatforms = [...answers.socialPlatforms]; while (socialPlatforms.length <= index) socialPlatforms.push(''); socialPlatforms[index] = event.target.value; onChange({ ...answers, socialPlatforms }) }} className="border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand"><option value="">Platforma</option>{socialPlatformOptions.map((option) => <option key={option}>{option}</option>)}</select><input aria-label={`Odkaz ${index + 1}`} type="url" value={url} onChange={(event) => { const socialLinks = [...links]; socialLinks[index] = event.target.value; onChange({ ...answers, socialLinks }) }} placeholder="https://" className="min-w-0 border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand" />{links.length > 1 && <button type="button" onClick={() => onChange({ ...answers, socialLinks: links.filter((_, itemIndex) => itemIndex !== index), socialPlatforms: answers.socialPlatforms.filter((_, itemIndex) => itemIndex !== index) })} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"><X className="size-4" /></button>}</div>)}</div>{links.length < 8 && <button type="button" onClick={() => onChange({ ...answers, socialLinks: [...links, ''], socialPlatforms: [...answers.socialPlatforms, ''] })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"><Plus className="size-4" /> Pridať sociálnu sieť</button>}</div>
}

function Group({ children, title }: { children: React.ReactNode; title: string }) {
  return <fieldset className="border-t border-border/70 pt-7 first:border-0 first:pt-0"><legend className="mb-6 text-base font-semibold tracking-[-0.02em]">{title}</legend><div className="grid gap-7 sm:grid-cols-2">{children}</div></fieldset>
}

function ChoiceField({ children, onChange, options, selected, title }: {
  children?: React.ReactNode
  onChange: (value: string[]) => void
  options: readonly string[]
  selected: string[]
  title: string
}) {
  return <div className="sm:col-span-2"><p className="mb-3 text-xs font-semibold text-muted-foreground">{title}</p><ChoiceGrid options={options} selected={selected} onChange={onChange} />{children}</div>
}

export function CoreWorkspaceFields({ actor, answers, assets = [], disabled, getAssetUrl, onChange }: {
  actor?: 'client'
  answers: OnboardingAnswers
  assets?: OnboardingAsset[]
  disabled?: boolean
  getAssetUrl?: (asset: OnboardingAsset) => string
  onChange: (answers: OnboardingAnswers) => void
}) {
  function emit(next: OnboardingAnswers, key?: PrefillFieldKey) {
    onChange(actor === 'client' && key ? markClientFieldChange(next, key) : next)
  }
  const hint = (key: PrefillFieldKey) => actor === 'client' && isUnconfirmedPrefill(answers, key)
    ? 'Predvyplnené z predchádzajúcej komunikácie'
    : undefined
  return (
    <fieldset disabled={disabled} className="space-y-10 disabled:opacity-70">
      <Group title="O vás a vašom podnikaní">
        <Field hint={hint('client.displayName')} label="Meno / názov podnikania" value={answers.client.displayName} onChange={(displayName) => emit({ ...answers, client: { displayName } }, 'client.displayName')} />
        <Field hint={hint('business.area')} label="Čomu sa venujete" value={answers.business.area} onChange={(area) => emit({ ...answers, business: { ...answers.business, area } }, 'business.area')} />
        <SelectField hint={hint('projectType')} label="Typ projektu / čo potrebujete" options={projectTypeOptions} value={answers.projectType} onChange={(projectType) => emit({ ...answers, projectType }, 'projectType')} />
        <div className="sm:col-span-2"><Field multiline label="Ako by ste opísali svoju prácu" value={answers.business.description} onChange={(description) => onChange({ ...answers, business: { ...answers.business, description } })} /></div>
        <div className="sm:col-span-2"><Field multiline label="Je za vašou značkou nejaký osobný príbeh, ktorý by mal zákazník poznať?" value={answers.brandStory} onChange={(brandStory) => onChange({ ...answers, brandStory })} /></div>
        <Field hint={hint('existingWebsite')} label="Existujúci web" value={answers.existingWebsite} onChange={(existingWebsite) => emit({ ...answers, existingWebsite }, 'existingWebsite')} />
        <SocialLinksField answers={answers} hint={hint('socialLinks')} onChange={(next) => emit(next, 'socialLinks')} />
      </Group>
      <Group title="Zákazníci a cieľ webu">
        <ChoiceField title="Kto sú vaši najčastejší zákazníci?" options={targetAudienceOptions} selected={answers.targetAudienceSelections} onChange={(targetAudienceSelections) => onChange({ ...answers, targetAudienceSelections })}><OtherAnswer show={answers.targetAudienceSelections.includes('Iné')} multiline label="Popíšte svojich zákazníkov" value={answers.targetAudience} onChange={(targetAudience) => onChange({ ...answers, targetAudience })} /></ChoiceField>
        <ChoiceField title={`Čo od nového webu očakávate?${hint('websiteExpectations') ? ' · Predvyplnené z predchádzajúcej komunikácie' : ''}`} options={websiteExpectationOptions} selected={answers.websiteExpectations} onChange={(websiteExpectations) => emit({ ...answers, websiteExpectations }, 'websiteExpectations')}><OtherAnswer show={answers.websiteExpectations.includes('Iné')} label="Iné očakávanie" value={answers.websiteExpectationsOther} onChange={(websiteExpectationsOther) => onChange({ ...answers, websiteExpectationsOther })} /></ChoiceField>
        <ChoiceField title="Čo sa má návštevník hlavne dozvedieť?" options={websiteInformationOptions} selected={answers.websiteInformation} onChange={(websiteInformation) => onChange({ ...answers, websiteInformation })}><OtherAnswer show={answers.websiteInformation.includes('Iné')} multiline label="Iná dôležitá informácia" value={answers.websiteGoal} onChange={(websiteGoal) => onChange({ ...answers, websiteGoal })} /></ChoiceField>
        <ChoiceField title="Čo má návštevník urobiť?" options={desiredActionOptions} selected={answers.desiredActions} onChange={(desiredActions) => onChange({ ...answers, desiredActions })}><OtherAnswer show={answers.desiredActions.includes('Iné')} label="Iná akcia" value={answers.desiredActionsOther} onChange={(desiredActionsOther) => onChange({ ...answers, desiredActionsOther })} /></ChoiceField>
        <ChoiceField title="Čo ponúkate?" options={offeringOptions} selected={answers.offeringTypes} onChange={(offeringTypes) => onChange({ ...answers, offeringTypes })}><OtherAnswer show={answers.offeringTypes.includes('Iné')} label="Iný typ ponuky" value={answers.services} onChange={(services) => onChange({ ...answers, services })} /><div className="mt-5"><RepeatableTextItems addLabel="Pridať konkrétny produkt alebo službu" label="Konkrétne produkty alebo služby" placeholder="Napr. servis bicykla" values={answers.offerItems} onChange={(offerItems) => onChange({ ...answers, offerItems })} /></div></ChoiceField>
        <div className="sm:col-span-2"><Field multiline label="Čo je na vašej ponuke najviac jedinečné?" hint="Čo je na vašich produktoch alebo službách také, čo zákazník inde bežne nenájde?" value={answers.uniqueOffering} onChange={(uniqueOffering) => onChange({ ...answers, uniqueOffering })} /></div>
        <div className="sm:col-span-2"><Field multiline label="Ak by si návštevník po odchode zo stránky zapamätal iba jednu vec o vás alebo vašej ponuke, čo by to malo byť?" value={answers.keyTakeaway} onChange={(keyTakeaway) => onChange({ ...answers, keyTakeaway })} /></div>
        <div className="sm:col-span-2"><Field multiline label="Čo by ste návštevníkovi ukázali ako prvé, keby ste mali iba 10 sekúnd?" value={answers.tenSecondHighlight} onChange={(tenSecondHighlight) => onChange({ ...answers, tenSecondHighlight })} /></div>
      </Group>
      <Group title="Obsah stránky">
        <ChoiceField title="Čo by ste chceli na stránke?" options={sectionOptions} selected={answers.sections} onChange={(sections) => onChange({ ...answers, sections })}><OtherAnswer show={answers.sections.includes('Iné')} label="Iná časť stránky" value={answers.sectionsOther} onChange={(sectionsOther) => onChange({ ...answers, sectionsOther })} /></ChoiceField>
        <ChoiceField title="Plánujete web v budúcnosti rozšíriť?" options={futureOptions} selected={answers.futureFeatures} onChange={(futureFeatures) => onChange({ ...answers, futureFeatures })}><OtherAnswer show={answers.futureFeatures.includes('Iné')} label="Iné rozšírenie" value={answers.futureFeaturesOther} onChange={(futureFeaturesOther) => onChange({ ...answers, futureFeaturesOther })} /></ChoiceField>
        <div className="sm:col-span-2"><Field multiline label="Je ešte niečo, čo chcete na stránke?" value={answers.otherSections} onChange={(otherSections) => onChange({ ...answers, otherSections })} /></div>
      </Group>
      <Group title="Vizuálny smer">
        <ChoiceField title="Aký pocit chcete, aby mal človek pri návšteve vašej stránky?" options={includeSavedOptions(brandFeelingOptions, answers.designPreferences)} selected={answers.designPreferences} onChange={(designPreferences) => onChange({ ...answers, designPreferences })}><OtherAnswer show={answers.designPreferences.includes('Iné')} label="Iný pocit" value={answers.designOther} onChange={(designOther) => onChange({ ...answers, designOther })} /></ChoiceField>
        <ChoiceField title="Aké farby vám sú blízke?" options={colorOptions} selected={answers.colorPreferences} onChange={(colorPreferences) => onChange({ ...answers, colorPreferences })}><OtherAnswer show={answers.colorPreferences.includes('Iné')} label="Iná farebná preferencia" value={answers.colorPreferencesOther} onChange={(colorPreferencesOther) => onChange({ ...answers, colorPreferencesOther })} /></ChoiceField>
        <ChoiceField title="Čomu sa má dizajn vyhnúť?" options={dislikeOptions} selected={answers.designDislikes} onChange={(designDislikes) => onChange({ ...answers, designDislikes })}><OtherAnswer show={answers.designDislikes.includes('Iné')} multiline label="Iné obmedzenie" value={answers.dislikes} onChange={(dislikes) => onChange({ ...answers, dislikes })} /></ChoiceField>
        <ListField label="Weby alebo značky, ktoré sa páčia" value={answers.inspirationUrls} onChange={(inspirationUrls) => onChange({ ...answers, inspirationUrls })} />
        {getAssetUrl && <RepresentativePhotoPicker assets={assets} getAssetUrl={getAssetUrl} selected={answers.representativePhotoIds} onChange={(representativePhotoIds) => onChange({ ...answers, representativePhotoIds })} />}
      </Group>
      <Group title="Kontakt a fakturácia">
        <Field hint={hint('contact.name')} label="Kontaktná osoba" value={answers.contact.name} onChange={(name) => emit({ ...answers, contact: { ...answers.contact, name } }, 'contact.name')} />
        <Field hint={hint('contact.email')} label="E-mail" value={answers.contact.email} onChange={(email) => emit({ ...answers, contact: { ...answers.contact, email } }, 'contact.email')} />
        <Field hint={hint('contact.phone')} label="Telefón" value={answers.contact.phone} onChange={(phone) => emit({ ...answers, contact: { ...answers.contact, phone } }, 'contact.phone')} />
        <ChoiceField title={`Ako vás má zákazník ideálne kontaktovať?${hint('contact.preferredMethods') ? ' · Predvyplnené z predchádzajúcej komunikácie' : ''}`} options={communicationOptions} selected={answers.contact.preferredMethods} onChange={(preferredMethods) => emit({ ...answers, contact: { ...answers.contact, preferredMethods } }, 'contact.preferredMethods')}><OtherAnswer show={answers.contact.preferredMethods.includes('Iné')} label="Iný spôsob kontaktu" value={answers.contact.preferredMethod} onChange={(preferredMethod) => onChange({ ...answers, contact: { ...answers.contact, preferredMethod } })} /></ChoiceField>
        <Field label="Fakturačný názov" value={answers.billing.companyName} onChange={(companyName) => onChange({ ...answers, billing: { ...answers.billing, companyName } })} />
        <Field label="IČO" value={answers.billing.companyId} onChange={(companyId) => onChange({ ...answers, billing: { ...answers.billing, companyId } })} />
        <Field label="DIČ" value={answers.billing.taxId} onChange={(taxId) => onChange({ ...answers, billing: { ...answers.billing, taxId } })} />
        <Field label="IČ DPH" value={answers.billing.vatId} onChange={(vatId) => onChange({ ...answers, billing: { ...answers.billing, vatId } })} />
        <div className="sm:col-span-2"><Field multiline label="Fakturačná adresa" value={answers.billing.address} onChange={(address) => onChange({ ...answers, billing: { ...answers.billing, address } })} /></div>
        <div className="sm:col-span-2"><Field hint={hint('additionalNotes')} multiline label="Ďalšie poznámky" value={answers.additionalNotes} onChange={(additionalNotes) => emit({ ...answers, additionalNotes }, 'additionalNotes')} /></div>
      </Group>
    </fieldset>
  )
}

export function DiscoveryWorkspaceFields({ answers, disabled, onChange }: {
  answers: Discovery2Answers
  disabled?: boolean
  onChange: (answers: Discovery2Answers) => void
}) {
  return (
    <fieldset disabled={disabled} className="space-y-10 disabled:opacity-70">
      <ChoiceField title="Ako dnes zákazník objednáva?" options={orderOptions} selected={answers.order_methods} onChange={(order_methods) => onChange({ ...answers, order_methods })}><OtherAnswer show={answers.order_methods.includes('Iné')} label="Iný spôsob" value={answers.order_methods_other} onChange={(order_methods_other) => onChange({ ...answers, order_methods_other })} /><div className="mt-5"><Field multiline label="Voliteľný opis procesu" value={answers.order_process} onChange={(order_process) => onChange({ ...answers, order_process })} /></div></ChoiceField>
      <div><p className="mb-4 text-xs font-semibold text-muted-foreground">Produkty, služby a ceny</p><ProductPriceList value={answers.products_and_prices} onChange={(products_and_prices) => onChange({ ...answers, products_and_prices })} />{answers.primary_products_and_prices && <div className="mt-5"><Field multiline label="Pôvodná odpoveď" value={answers.primary_products_and_prices} onChange={(primary_products_and_prices) => onChange({ ...answers, primary_products_and_prices })} /></div>}</div>
      <ChoiceField title="Čo môže zákazník prispôsobiť?" options={personalizationOptions} selected={answers.personalization_choices} onChange={(personalization_choices) => onChange({ ...answers, personalization_choices })}><OtherAnswer show={answers.personalization_choices.includes('Iné')} label="Iná možnosť" value={answers.personalization_options} onChange={(personalization_options) => onChange({ ...answers, personalization_options })} /></ChoiceField>
      <ChoiceField title="Čo zákazníci najviac oceňujú?" options={appreciationOptions} selected={answers.customer_appreciation_choices} onChange={(customer_appreciation_choices) => onChange({ ...answers, customer_appreciation_choices })}><OtherAnswer show={answers.customer_appreciation_choices.includes('Iné')} label="Čo ešte oceňujú" value={answers.customer_appreciation} onChange={(customer_appreciation) => onChange({ ...answers, customer_appreciation })} /><div className="mt-5"><Field multiline label="Konkrétna reakcia zákazníka" value={answers.customer_quote} onChange={(customer_quote) => onChange({ ...answers, customer_quote })} /></div></ChoiceField>
      <ChoiceField title="Čo sa zákazníci najčastejšie pýtajú?" options={frequentQuestionOptions} selected={answers.frequent_questions} onChange={(frequent_questions) => onChange({ ...answers, frequent_questions })}><OtherAnswer show={answers.frequent_questions.includes('Iné')} multiline label="Iná otázka" value={answers.frequent_questions_other} onChange={(frequent_questions_other) => onChange({ ...answers, frequent_questions_other })} /></ChoiceField>
      <ChoiceField title="Čo musí byť na novom webe určite?" options={mustShowOptions} selected={answers.must_show_choices} onChange={(must_show_choices) => onChange({ ...answers, must_show_choices })}><OtherAnswer show={answers.must_show_choices.includes('Iné')} multiline label="Čo ešte musí byť na webe" value={answers.must_show_on_website} onChange={(must_show_on_website) => onChange({ ...answers, must_show_on_website })} /></ChoiceField>
    </fieldset>
  )
}
