'use client'

import { createContext, useContext, useEffect, useId, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { ChoiceGrid, OtherAnswer, ProductPriceList, RepeatableTextItems } from '@/components/onboarding/quick-fields'
import { RepresentativePhotoPicker } from '@/components/onboarding/representative-photo-picker'
import {
  appreciationOptions, brandAttributeOptions, colorOptions, communicationOptions, desiredActionOptions,
  dislikeOptions, frequentQuestionOptions, futureOptions, mustShowOptions, offeringOptions,
  includeSavedOptions, infrastructureStatusOptions, orderOptions, personalizationOptions, sectionOptions, targetAudienceOptions,
  projectTypeOptions, socialPlatformOptions, websiteExpectationOptions, websiteInformationOptions,
  campaignAssetOptions, campaignBudgetOptions, campaignDestinationOptions, campaignDurationOptions,
  campaignGoalOptions, campaignMetaSetupOptions, campaignPlatformOptions, campaignServiceOptions,
  campaignTrackingOptions, previousCampaignOptions,
  multiPageContentOwnerOptions, multiPageEditableContentOptions, multiPageFeatureOptions,
  multiPageProductOptions, multiPageScopeOptions, completionTimeOptions, redesignChangeOptions,
  technicalRequirementOptions, trafficSourceOptions, websiteManagementOptions, keepExclusiveChoice,
} from '@/lib/onboarding/options'
import { isUnconfirmedPrefill, markClientFieldChange } from '@/lib/onboarding/prefill'
import type { ImplementationFieldKey } from '@/lib/onboarding/implementation-brief'
import type { Discovery2Answers, ImplementationFieldSelection, OnboardingAnswers, OnboardingAsset, OnboardingType, PrefillFieldKey } from '@/lib/onboarding/types'

type ImplementationSelectionContextValue = {
  onChange: (fieldKey: ImplementationFieldKey, included: boolean) => void
  selection: ImplementationFieldSelection
}

const ImplementationSelectionContext = createContext<ImplementationSelectionContextValue | null>(null)

const clientCoreNavigationItems = [
  { id: 'form-about', label: 'O vás' },
  { id: 'form-domain', label: 'Doména a hosting' },
  { id: 'form-goal', label: 'Zákazníci a cieľ' },
  { id: 'form-content', label: 'Obsah stránky' },
  { id: 'form-visual', label: 'Vizuálny smer' },
  { id: 'form-collaboration', label: 'Spolupráca' },
  { id: 'form-contact', label: 'Kontakt' },
] as const

const clientMultiPageNavigationItems = [
  ...clientCoreNavigationItems.slice(0, 3),
  { id: 'form-content', label: 'Rozsah webu' },
  { id: 'form-products', label: 'Produkty' },
  ...clientCoreNavigationItems.slice(4),
]

function ClientFormNavigation({ items }: { items: ReadonlyArray<{ id: string; label: string }> }) {
  const [activeId, setActiveId] = useState(items[0]?.id || '')
  const linksRef = useRef<HTMLDivElement>(null)
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId))

  useEffect(() => {
    let frame = 0

    function updatePosition() {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        let currentId = items[0]?.id || ''

        for (const item of items) {
          const section = document.getElementById(item.id)
          if (section && section.getBoundingClientRect().top <= 112) currentId = item.id
        }

        setActiveId(currentId)
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [items])

  useEffect(() => {
    const links = linksRef.current
    const activeLink = links?.querySelector<HTMLElement>(`[data-form-section="${activeId}"]`)
    if (!links || !activeLink) return
    const left = activeLink.offsetLeft - (links.clientWidth - activeLink.offsetWidth) / 2
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    links.scrollTo({ behavior: reducedMotion ? 'auto' : 'smooth', left })
  }, [activeId])

  function navigate(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
    setActiveId(id)
  }

  return (
    <nav aria-label="Časti formulára" className="sticky top-0 z-20 -mx-5 mb-9 border-y border-border/70 bg-background/95 px-5 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex min-h-14 items-center gap-4">
        <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
          Formulár <span className="text-brand">{activeIndex + 1}/{items.length}</span>
        </span>
        <div ref={linksRef} className="flex min-w-0 flex-1 gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={active ? 'location' : undefined}
                data-form-section={item.id}
                onClick={(event) => navigate(event, item.id)}
                className={`relative flex min-h-14 shrink-0 items-center text-sm font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand after:transition-transform ${active ? 'text-brand after:scale-x-100' : 'text-muted-foreground after:scale-x-0 hover:text-foreground'}`}
              >
                {item.label}
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function ImplementationToggle({ fieldKey }: { fieldKey?: ImplementationFieldKey }) {
  const context = useContext(ImplementationSelectionContext)
  if (!context || !fieldKey) return null
  return (
    <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-[11px] font-medium text-muted-foreground hover:text-foreground">
      <input
        type="checkbox"
        checked={context.selection[fieldKey] === true}
        onChange={(event) => context.onChange(fieldKey, event.target.checked)}
        className="size-3.5 accent-[var(--brand)]"
      />
      Zahrnúť do implementačného zadania
    </label>
  )
}

function ImportantLabel({ answered }: { answered: boolean }) {
  return <span className="ml-1 text-[11px] font-semibold text-brand">{answered ? 'Dôležité' : 'Dôležité · treba doplniť'}</span>
}

function isResolvedAnswer(value: string) {
  return Boolean(value.trim()) && !value.toLocaleLowerCase('sk').includes('neviem')
}

function Field({ hint, implementationKey, important = false, label, multiline = false, onChange, type = 'text', value }: {
  hint?: string
  implementationKey?: ImplementationFieldKey
  important?: boolean
  label: string
  multiline?: boolean
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  const id = useId()
  const className = 'mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm leading-6 outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-70'
  return <div className="block"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><label htmlFor={id} className="text-xs font-semibold text-muted-foreground">{label}{important && <ImportantLabel answered={isResolvedAnswer(value)} />}</label><ImplementationToggle fieldKey={implementationKey} /></div>{hint && <span className="mt-1 block text-xs text-brand/80">{hint}</span>}{multiline ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${className} min-h-24 resize-y`} /> : <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={className} />}</div>
}

function SelectField({ hint, implementationKey, important = false, label, onChange, options, value }: { hint?: string; implementationKey?: ImplementationFieldKey; important?: boolean; label: string; onChange: (value: string) => void; options: readonly string[]; value: string }) {
  const id = useId()
  return <div className="block"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><label htmlFor={id} className="text-xs font-semibold text-muted-foreground">{label}{important && <ImportantLabel answered={isResolvedAnswer(value)} />}</label><ImplementationToggle fieldKey={implementationKey} /></div>{hint && <span className="mt-1 block text-xs text-brand/80">{hint}</span>}<select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand"><option value="">Nevyplnené</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>
}

function ListField({ implementationKey, label, onChange, value }: { implementationKey?: ImplementationFieldKey; label: string; onChange: (value: string[]) => void; value: string[] }) {
  return <Field implementationKey={implementationKey} label={`${label} (jeden údaj na riadok)`} multiline value={value.join('\n')} onChange={(next) => onChange(next.split('\n'))} />
}

function SocialLinksField({ answers, hint, implementationKey, onChange }: { answers: OnboardingAnswers; hint?: string; implementationKey?: ImplementationFieldKey; onChange: (answers: OnboardingAnswers) => void }) {
  const links = answers.socialLinks.length ? answers.socialLinks : ['']
  return <div className="sm:col-span-2"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><p className="text-xs font-semibold text-muted-foreground">Sociálne siete</p><ImplementationToggle fieldKey={implementationKey} /></div>{hint && <p className="mt-1 text-xs text-brand/80">{hint}</p>}<div className="mt-2 space-y-3">{links.map((url, index) => <div key={index} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3"><select aria-label={`Platforma ${index + 1}`} value={answers.socialPlatforms[index] || ''} onChange={(event) => { const socialPlatforms = [...answers.socialPlatforms]; while (socialPlatforms.length <= index) socialPlatforms.push(''); socialPlatforms[index] = event.target.value; onChange({ ...answers, socialPlatforms }) }} className="border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand"><option value="">Platforma</option>{socialPlatformOptions.map((option) => <option key={option}>{option}</option>)}</select><input aria-label={`Odkaz ${index + 1}`} type="url" value={url} onChange={(event) => { const socialLinks = [...links]; socialLinks[index] = event.target.value; onChange({ ...answers, socialLinks }) }} placeholder="https://" className="min-w-0 border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none focus:border-brand" />{links.length > 1 && <button type="button" onClick={() => onChange({ ...answers, socialLinks: links.filter((_, itemIndex) => itemIndex !== index), socialPlatforms: answers.socialPlatforms.filter((_, itemIndex) => itemIndex !== index) })} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"><X className="size-4" /></button>}</div>)}</div>{links.length < 8 && <button type="button" onClick={() => onChange({ ...answers, socialLinks: [...links, ''], socialPlatforms: [...answers.socialPlatforms, ''] })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"><Plus className="size-4" /> Pridať sociálnu sieť</button>}</div>
}

function Group({ children, id, title }: { children: React.ReactNode; id?: string; title: string }) {
  return <fieldset id={id} className="scroll-mt-4 border-t border-border/70 pt-7 first:border-0 first:pt-0"><legend className="mb-6 text-base font-semibold tracking-[-0.02em]">{title}</legend><div className="grid gap-7 sm:grid-cols-2">{children}</div></fieldset>
}

function ChoiceField({ children, implementationKey, important = false, onChange, options, selected, title }: {
  children?: React.ReactNode
  implementationKey?: ImplementationFieldKey
  important?: boolean
  onChange: (value: string[]) => void
  options: readonly string[]
  selected: string[]
  title: string
}) {
  return <div className="sm:col-span-2"><div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><p className="text-xs font-semibold text-muted-foreground">{title}{important && <ImportantLabel answered={selected.some(isResolvedAnswer)} />}</p><ImplementationToggle fieldKey={implementationKey} /></div><ChoiceGrid options={options} selected={selected} onChange={onChange} />{children}</div>
}

export function CoreWorkspaceFields({ actor, answers, assets = [], disabled, getAssetUrl, implementationSelection = {}, onboardingType = 'landing_page', onChange, onImplementationSelectionChange }: {
  actor?: 'client'
  answers: OnboardingAnswers
  assets?: OnboardingAsset[]
  disabled?: boolean
  getAssetUrl?: (asset: OnboardingAsset) => string
  implementationSelection?: ImplementationFieldSelection
  onboardingType?: OnboardingType
  onChange: (answers: OnboardingAnswers) => void
  onImplementationSelectionChange?: (fieldKey: ImplementationFieldKey, included: boolean) => void
}) {
  function emit(next: OnboardingAnswers, key?: PrefillFieldKey) {
    onChange(actor === 'client' && key ? markClientFieldChange(next, key) : next)
  }
  const hint = (key: PrefillFieldKey) => actor === 'client' && isUnconfirmedPrefill(answers, key)
    ? 'Predvyplnené z predchádzajúcej komunikácie'
    : undefined
  const hasExistingWebsite = answers.existingWebsiteStatus === 'Áno' || (!answers.existingWebsiteStatus && Boolean(answers.existingWebsite.trim()))
  const integrationRequirement = 'Potrebujeme prepojenie s externou službou alebo systémom.'
  const hasTechnicalDetails = answers.technicalRequirements.some((requirement) => !['Nemáme žiadne špeciálne požiadavky.', 'Neviem, potrebujem poradiť.', ...(onboardingType === 'multi_page_website' ? [integrationRequirement] : [])].includes(requirement))
  return (
    <ImplementationSelectionContext.Provider value={onImplementationSelectionChange ? { onChange: onImplementationSelectionChange, selection: implementationSelection } : null}>
    {actor === 'client' && <ClientFormNavigation items={onboardingType === 'multi_page_website' ? clientMultiPageNavigationItems : clientCoreNavigationItems} />}
    <fieldset disabled={disabled} className="space-y-10 disabled:opacity-70">
      <Group id="form-about" title="O vás a vašom podnikaní">
        <Field implementationKey="core.display_name" hint={hint('client.displayName')} label="Meno / názov podnikania" value={answers.client.displayName} onChange={(displayName) => emit({ ...answers, client: { displayName } }, 'client.displayName')} />
        <Field implementationKey="core.business_area" hint={hint('business.area')} label="Čomu sa venujete" value={answers.business.area} onChange={(area) => emit({ ...answers, business: { ...answers.business, area } }, 'business.area')} />
        {onboardingType !== 'multi_page_website' && <SelectField implementationKey="core.project_type" hint={hint('projectType')} label="Typ projektu / čo potrebujete" options={projectTypeOptions} value={answers.projectType} onChange={(projectType) => emit({ ...answers, projectType }, 'projectType')} />}
        <div className="sm:col-span-2"><Field implementationKey="core.business_description" multiline label="Povedzte mi trochu viac o vašom podnikaní a o tom, čomu sa venujete." value={answers.business.description} onChange={(description) => onChange({ ...answers, business: { ...answers.business, description } })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.brand_story" multiline label="Je za vašou značkou nejaký osobný príbeh, ktorý by mal zákazník poznať?" value={answers.brandStory} onChange={(brandStory) => onChange({ ...answers, brandStory })} /></div>
        <SelectField implementationKey="core.existing_website_status" label="Máte už existujúci web?" options={infrastructureStatusOptions} value={hasExistingWebsite ? 'Áno' : answers.existingWebsiteStatus} onChange={(existingWebsiteStatus) => emit({ ...answers, existingWebsiteStatus, existingWebsite: existingWebsiteStatus === 'Áno' ? answers.existingWebsite : '', redesignChanges: existingWebsiteStatus === 'Áno' ? answers.redesignChanges : [], redesignDetails: existingWebsiteStatus === 'Áno' ? answers.redesignDetails : '' }, 'existingWebsite')} />
        {hasExistingWebsite && <Field implementationKey="core.existing_website" hint={hint('existingWebsite')} label="Adresa existujúceho webu" type="url" value={answers.existingWebsite} onChange={(existingWebsite) => emit({ ...answers, existingWebsite }, 'existingWebsite')} />}
        {hasExistingWebsite && <ChoiceField implementationKey="core.redesign_changes" title="Čo by ste chceli na svojej súčasnej webovej stránke zmeniť?" options={redesignChangeOptions} selected={answers.redesignChanges} onChange={(next) => onChange({ ...answers, redesignChanges: keepExclusiveChoice(answers.redesignChanges, next, ['Ešte neviem, potrebujem poradiť.']) })}><div className="mt-5"><Field multiline label="Podrobnejší opis požadovaných zmien (nepovinné)" value={answers.redesignDetails} onChange={(redesignDetails) => onChange({ ...answers, redesignDetails })} /></div></ChoiceField>}
        <div className="sm:col-span-2"><Field implementationKey="core.previous_website_experience" multiline label="Mali ste už web alebo ste skúšali niečo podobné? Čo fungovalo a čo nie?" value={answers.previousWebsiteExperience} onChange={(previousWebsiteExperience) => onChange({ ...answers, previousWebsiteExperience })} /></div>
        <SocialLinksField implementationKey="core.social_links" answers={answers} hint={hint('socialLinks')} onChange={(next) => emit(next, 'socialLinks')} />
      </Group>
      <Group id="form-domain" title="Doména a hosting">
        <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">Nevkladajte sem prihlasovacie údaje ani heslá. Prístupy si v prípade potreby odovzdáme bezpečným spôsobom.</p>
        <SelectField implementationKey="core.domain_ownership" label="Máte už zaregistrovanú doménu?" options={infrastructureStatusOptions} value={answers.domain.ownership} onChange={(ownership) => onChange({ ...answers, domain: { ...answers.domain, ownership, registrar: ownership === 'Áno' ? answers.domain.registrar : '' } })} />
        <Field implementationKey="core.domain_name" label="Doména, ktorú máte alebo by ste chceli" hint="Napr. vasafirma.sk" value={answers.domain.name} onChange={(name) => onChange({ ...answers, domain: { ...answers.domain, name } })} />
        {answers.domain.ownership === 'Áno' && <Field implementationKey="core.domain_registrar" label="Registrátor domény" hint="Napr. Websupport, Webglobe, Forpsi" value={answers.domain.registrar} onChange={(registrar) => onChange({ ...answers, domain: { ...answers.domain, registrar } })} />}
        <SelectField implementationKey="core.hosting_status" label="Máte už webhosting?" options={infrastructureStatusOptions} value={answers.hosting.status} onChange={(status) => onChange({ ...answers, hosting: { status, provider: status === 'Áno' ? answers.hosting.provider : '' } })} />
        {answers.hosting.status === 'Áno' && <Field implementationKey="core.hosting_provider" label="Poskytovateľ webhostingu" hint="Napr. Websupport, Webglobe, Forpsi" value={answers.hosting.provider} onChange={(provider) => onChange({ ...answers, hosting: { ...answers.hosting, provider } })} />}
        <ChoiceField implementationKey="core.technical_requirements" title="Existujú nejaké technické požiadavky alebo obmedzenia, ktoré by sme mali pri tvorbe stránky zohľadniť?" options={technicalRequirementOptions} selected={answers.technicalRequirements} onChange={(next) => { const technicalRequirements = keepExclusiveChoice(answers.technicalRequirements, next, ['Nemáme žiadne špeciálne požiadavky.', 'Neviem, potrebujem poradiť.']); const needsDetails = technicalRequirements.some((requirement) => !['Nemáme žiadne špeciálne požiadavky.', 'Neviem, potrebujem poradiť.', ...(onboardingType === 'multi_page_website' ? [integrationRequirement] : [])].includes(requirement)); onChange({ ...answers, technicalRequirements, technicalRequirementsDetails: needsDetails ? answers.technicalRequirementsDetails : '', multiPage: { ...answers.multiPage, integrations: technicalRequirements.includes(integrationRequirement) || answers.multiPage.features.includes('Prepojenie s iným systémom') ? answers.multiPage.integrations : '' } }) }} />
        {hasTechnicalDetails && <div className="sm:col-span-2"><Field implementationKey="core.technical_requirements_details" multiline label={onboardingType === 'multi_page_website' ? 'Bližšie opíšte ostatné technické požiadavky' : 'Bližšie opíšte technické požiadavky'} hint="Stačí stručný opis. Prihlasovacie údaje neposielajte." value={answers.technicalRequirementsDetails} onChange={(technicalRequirementsDetails) => onChange({ ...answers, technicalRequirementsDetails })} /></div>}
        {onboardingType === 'multi_page_website' && answers.technicalRequirements.includes(integrationRequirement) && <div className="sm:col-span-2"><Field implementationKey="multi.integrations" important multiline label="S akými systémami sa má web prepojiť a čo sa má prenášať?" hint="Stačí názov služby a opis; prihlasovacie údaje sem neposielajte." value={answers.multiPage.integrations} onChange={(integrations) => onChange({ ...answers, multiPage: { ...answers.multiPage, integrations } })} /></div>}
      </Group>
      <Group id="form-goal" title="Zákazníci a cieľ webu">
        <ChoiceField implementationKey="core.traffic_sources" title="Ako sa budú zákazníci najčastejšie dostávať na vašu webovú stránku?" options={trafficSourceOptions} selected={answers.trafficSources} onChange={(next) => { const trafficSources = keepExclusiveChoice(answers.trafficSources, next, ['Zatiaľ neviem.']); onChange({ ...answers, trafficSources, trafficSourcesOther: trafficSources.includes('Iné.') ? answers.trafficSourcesOther : '' }) }} />
        {answers.trafficSources.includes('Iné.') && <div className="sm:col-span-2"><Field implementationKey="core.traffic_sources_other" label="Iný zdroj návštevnosti" value={answers.trafficSourcesOther} onChange={(trafficSourcesOther) => onChange({ ...answers, trafficSourcesOther })} /></div>}
        <ChoiceField implementationKey="core.target_audience" title="Kto je váš ideálny zákazník?" options={targetAudienceOptions} selected={answers.targetAudienceSelections} onChange={(targetAudienceSelections) => onChange({ ...answers, targetAudienceSelections })}><OtherAnswer show multiline label="Kto nakupuje dnes a koho chcete získavať viac" value={answers.targetAudience} onChange={(targetAudience) => onChange({ ...answers, targetAudience })} /></ChoiceField>
        <div className="sm:col-span-2"><Field implementationKey="core.customer_insights" multiline label="Čo viete zo skúseností o svojich zákazníkoch – čo najviac riešia, oceňujú alebo sa pýtajú?" value={answers.customerInsights} onChange={(customerInsights) => onChange({ ...answers, customerInsights })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.customer_concerns" multiline label="Aké najčastejšie obavy má zákazník pred objednávkou?" hint="Napr. cena, termín, kvalita výsledku, dôvera, reklamácia alebo neistota z výsledku." value={answers.customerConcerns} onChange={(customerConcerns) => onChange({ ...answers, customerConcerns })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.desired_customer_reaction" multiline label="Akú konkrétnu reakciu zákazníka by ste chceli po návšteve webu?" hint="Napr. „Títo presne vedia, čo robia.“" value={answers.desiredCustomerReaction} onChange={(desiredCustomerReaction) => onChange({ ...answers, desiredCustomerReaction })} /></div>
        <ChoiceField implementationKey="core.website_expectations" title={`Čo chcete pomocou nového webu dosiahnuť?${hint('websiteExpectations') ? ' · Predvyplnené z predchádzajúcej komunikácie' : ''}`} options={websiteExpectationOptions} selected={answers.websiteExpectations} onChange={(websiteExpectations) => emit({ ...answers, websiteExpectations }, 'websiteExpectations')}><OtherAnswer show={answers.websiteExpectations.includes('Iné')} label="Iný cieľ" value={answers.websiteExpectationsOther} onChange={(websiteExpectationsOther) => onChange({ ...answers, websiteExpectationsOther })} /></ChoiceField>
        <div className="sm:col-span-2"><Field implementationKey="core.goal_importance" multiline label="Prečo je pre vás tento cieľ dôležitý?" value={answers.goalImportance} onChange={(goalImportance) => onChange({ ...answers, goalImportance })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.success_criteria" multiline label="Podľa čoho spoznáte, že nový web funguje a ste s ním spokojný?" value={answers.successCriteria} onChange={(successCriteria) => onChange({ ...answers, successCriteria })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.website_priorities" multiline label="Čo je pre vás na novom webe najdôležitejšie?" value={answers.websitePriorities} onChange={(websitePriorities) => onChange({ ...answers, websitePriorities })} /></div>
        <ChoiceField implementationKey="core.website_information" title="Čo sa má návštevník hlavne dozvedieť?" options={websiteInformationOptions} selected={answers.websiteInformation} onChange={(websiteInformation) => onChange({ ...answers, websiteInformation })}><OtherAnswer show={answers.websiteInformation.includes('Iné')} multiline label="Iná dôležitá informácia" value={answers.websiteGoal} onChange={(websiteGoal) => onChange({ ...answers, websiteGoal })} /></ChoiceField>
        <ChoiceField implementationKey="core.desired_actions" title="Čo má návštevník urobiť?" options={desiredActionOptions} selected={answers.desiredActions} onChange={(desiredActions) => onChange({ ...answers, desiredActions })}><OtherAnswer show={answers.desiredActions.includes('Iné')} label="Iná akcia" value={answers.desiredActionsOther} onChange={(desiredActionsOther) => onChange({ ...answers, desiredActionsOther })} /></ChoiceField>
        <ChoiceField implementationKey="core.offering" title="Čo ponúkate?" options={offeringOptions} selected={answers.offeringTypes} onChange={(offeringTypes) => onChange({ ...answers, offeringTypes })}><OtherAnswer show={answers.offeringTypes.includes('Iné')} label="Iný typ ponuky" value={answers.services} onChange={(services) => onChange({ ...answers, services })} /><div className="mt-5"><RepeatableTextItems addLabel="Pridať konkrétny produkt alebo službu" label="Konkrétne produkty alebo služby" placeholder="Napr. servis bicykla" values={answers.offerItems} onChange={(offerItems) => onChange({ ...answers, offerItems })} /></div></ChoiceField>
        <div className="sm:col-span-2"><Field implementationKey="core.unique_offering" multiline label="Čo je na vašej ponuke najviac jedinečné?" hint="Čo je na vašich produktoch alebo službách také, čo zákazník inde bežne nenájde?" value={answers.uniqueOffering} onChange={(uniqueOffering) => onChange({ ...answers, uniqueOffering })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.key_takeaway" multiline label="Ak by si návštevník po odchode zo stránky zapamätal iba jednu vec o vás alebo vašej ponuke, čo by to malo byť?" value={answers.keyTakeaway} onChange={(keyTakeaway) => onChange({ ...answers, keyTakeaway })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.ten_second_highlight" multiline label="Čo by ste návštevníkovi ukázali ako prvé, keby ste mali iba 10 sekúnd?" value={answers.tenSecondHighlight} onChange={(tenSecondHighlight) => onChange({ ...answers, tenSecondHighlight })} /></div>
      </Group>
      {onboardingType === 'multi_page_website' ? <>
      <Group id="form-content" title="Rozsah a správa webu">
        <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">Otázky označené ako <span className="font-semibold text-brand">Dôležité</span> potrebujeme vyriešiť pred presným návrhom a nacenením. Ak si nie ste istý, pokojne napíšte „neviem“.</p>
        <SelectField implementationKey="multi.project_scope" important label="Čo ideme vytvoriť?" options={multiPageScopeOptions} value={answers.multiPage.projectScope} onChange={(projectScope) => onChange({ ...answers, multiPage: { ...answers.multiPage, projectScope } })} />
        <SelectField implementationKey="multi.content_owner" important label="Kto pripraví texty a vyberie podklady pre jednotlivé stránky?" options={multiPageContentOwnerOptions} value={answers.multiPage.contentOwner} onChange={(contentOwner) => onChange({ ...answers, multiPage: { ...answers.multiPage, contentOwner } })} />
        <ChoiceField implementationKey="multi.editable_content" important title="Čo budete chcieť po spustení sami pridávať alebo upravovať?" options={multiPageEditableContentOptions} selected={answers.multiPage.editableContent} onChange={(next) => onChange({ ...answers, multiPage: { ...answers.multiPage, editableContent: keepExclusiveChoice(answers.multiPage.editableContent, next, ['Nechcem obsah upravovať sám', 'Ešte neviem']) } })} />
        <Field implementationKey="multi.content_changes" label="Ako často očakávate zmeny obsahu?" hint="Napr. nové realizácie každý mesiac, články raz za týždeň, cenník príležitostne." value={answers.multiPage.contentChanges} onChange={(contentChanges) => onChange({ ...answers, multiPage: { ...answers.multiPage, contentChanges } })} />
        <Field implementationKey="multi.languages" important label="V akých jazykoch má byť web?" hint="Napr. slovenčina a angličtina. Ak stačí slovenčina, napíšte to." value={answers.multiPage.languages} onChange={(languages) => onChange({ ...answers, multiPage: { ...answers.multiPage, languages } })} />
        {answers.multiPage.languages.trim() && !['slovenčina', 'slovensky', 'sk'].includes(answers.multiPage.languages.trim().toLocaleLowerCase('sk')) && <Field implementationKey="multi.translation_owner" important label="Kto dodá alebo schváli preklady?" value={answers.multiPage.translationOwner} onChange={(translationOwner) => onChange({ ...answers, multiPage: { ...answers.multiPage, translationOwner } })} />}
        <ChoiceField implementationKey="multi.features" important title="Aké funkcie web potrebuje?" options={multiPageFeatureOptions} selected={answers.multiPage.features} onChange={(next) => { const features = keepExclusiveChoice(answers.multiPage.features, next, ['Žiadne špeciálne funkcie', 'Ešte neviem']); onChange({ ...answers, multiPage: { ...answers.multiPage, features, integrations: features.includes('Prepojenie s iným systémom') || answers.technicalRequirements.includes(integrationRequirement) ? answers.multiPage.integrations : '' } }) }} />
        {answers.multiPage.features.includes('Dopytové formuláre') && <div className="sm:col-span-2"><Field implementationKey="multi.forms_details" important multiline label="Aké formuláre potrebujete a kam majú chodiť odoslané správy?" hint="Napr. všeobecný kontakt, samostatný dopyt pre službu, prílohy alebo špeciálne polia. Neuvádzajte heslá." value={answers.multiPage.formsDetails} onChange={(formsDetails) => onChange({ ...answers, multiPage: { ...answers.multiPage, formsDetails } })} /></div>}
        {answers.multiPage.features.some((feature) => ['Rezervácie', 'Newsletter', 'Vyhľadávanie', 'Pobočky / mapy', 'Blog / články'].includes(feature)) && <div className="sm:col-span-2"><Field implementationKey="multi.features_details" multiline label="Ako majú vybrané funkcie fungovať?" hint="Napr. pri rezerváciách termíny a potvrdenia; pri blogu kto bude písať články." value={answers.multiPage.featuresDetails} onChange={(featuresDetails) => onChange({ ...answers, multiPage: { ...answers.multiPage, featuresDetails } })} /></div>}
        {answers.multiPage.features.includes('Prepojenie s iným systémom') && !answers.technicalRequirements.includes(integrationRequirement) && <div className="sm:col-span-2"><Field implementationKey="multi.integrations" important multiline label="S akými systémami sa má web prepojiť a čo sa má prenášať?" hint="Napr. CRM, fakturácia, rezervačný systém. Stačí názov služby a opis; prihlasovacie údaje sem neposielajte." value={answers.multiPage.integrations} onChange={(integrations) => onChange({ ...answers, multiPage: { ...answers.multiPage, integrations } })} /></div>}
        {answers.multiPage.projectScope === 'Redizajn existujúceho webu' && <>
          <div className="sm:col-span-2"><Field implementationKey="multi.migration_content" important multiline label="Čo treba zo starého webu zachovať alebo preniesť?" hint="Texty, články, realizácie, produkty, fotografie, existujúce podstránky; prípadne čo už nechcete." value={answers.multiPage.migrationContent} onChange={(migrationContent) => onChange({ ...answers, multiPage: { ...answers.multiPage, migrationContent } })} /></div>
          <div className="sm:col-span-2"><Field implementationKey="multi.migration_urls" multiline label="Ktoré existujúce odkazy alebo stránky musia zostať dostupné?" hint="Dôležité pre presmerovania zo starého webu a zachovanie návštevnosti." value={answers.multiPage.migrationUrls} onChange={(migrationUrls) => onChange({ ...answers, multiPage: { ...answers.multiPage, migrationUrls } })} /></div>
        </>}
        <Field implementationKey="multi.decision_maker" label="Kto bude schvaľovať obsah a finálnu podobu webu?" value={answers.multiPage.decisionMaker} onChange={(decisionMaker) => onChange({ ...answers, multiPage: { ...answers.multiPage, decisionMaker } })} />
      </Group>
      <Group id="form-products" title="Produkty a predaj">
        <SelectField implementationKey="multi.product_mode" important label="Ako majú byť produkty na webe zobrazené alebo predávané?" options={multiPageProductOptions} value={answers.multiPage.productMode} onChange={(productMode) => onChange({ ...answers, multiPage: { ...answers.multiPage, productMode } })} />
        {answers.multiPage.productMode && answers.multiPage.productMode !== 'Produkty na webe nepotrebujem' && <>
          <Field implementationKey="multi.product_count" important label="Koľko produktov približne máte a budú sa často meniť?" value={answers.multiPage.productCount} onChange={(productCount) => onChange({ ...answers, multiPage: { ...answers.multiPage, productCount } })} />
          <Field implementationKey="multi.product_source" important label="Odkiaľ vezmeme názvy, ceny, popisy a fotografie produktov?" hint="Napr. existujúci e-shop, tabuľka, katalóg alebo ich pripravíte vy." value={answers.multiPage.productSource} onChange={(productSource) => onChange({ ...answers, multiPage: { ...answers.multiPage, productSource } })} />
          <div className="sm:col-span-2"><Field implementationKey="multi.product_details" multiline label="Majú produkty varianty, kategórie alebo špeciálne parametre?" hint="Napr. veľkosti, farby, filtrovanie, dostupnosť, ceny bez DPH alebo dopyt namiesto nákupu." value={answers.multiPage.productDetails} onChange={(productDetails) => onChange({ ...answers, multiPage: { ...answers.multiPage, productDetails } })} /></div>
        </>}
        {(answers.multiPage.productMode === 'Produkty s odkazom na existujúci e-shop' || answers.multiPage.productMode === 'Nákup a platba priamo na novom webe') && <>
          <Field implementationKey="multi.shop_url" important={answers.multiPage.productMode === 'Produkty s odkazom na existujúci e-shop'} label="Máte už e-shop? Pošlite jeho adresu, ak existuje." value={answers.multiPage.shopUrl} onChange={(shopUrl) => onChange({ ...answers, multiPage: { ...answers.multiPage, shopUrl } })} />
          <Field implementationKey="multi.shop_platform" label="Na akej platforme funguje alebo má fungovať?" hint="Napr. Shoptet, Shopify, WooCommerce alebo neviem." value={answers.multiPage.shopPlatform} onChange={(shopPlatform) => onChange({ ...answers, multiPage: { ...answers.multiPage, shopPlatform } })} />
        </>}
        {answers.multiPage.productMode === 'Nákup a platba priamo na novom webe' && <div className="sm:col-span-2"><Field implementationKey="multi.checkout_details" important multiline label="Ako má prebiehať objednávka, platba, doprava a správa skladu?" hint="Uveďte požadované spôsoby platby a dopravy, skladové zásoby, fakturáciu, krajiny predaja a kto vybavuje objednávky. E-shop naceníme ako samostatný rozsah." value={answers.multiPage.checkoutDetails} onChange={(checkoutDetails) => onChange({ ...answers, multiPage: { ...answers.multiPage, checkoutDetails } })} /></div>}
      </Group>
      </> : <Group id="form-content" title="Obsah stránky">
        <ChoiceField implementationKey="core.sections" title="Čo by ste chceli na stránke?" options={sectionOptions} selected={answers.sections} onChange={(sections) => onChange({ ...answers, sections })}><OtherAnswer show={answers.sections.includes('Iné')} label="Iná časť stránky" value={answers.sectionsOther} onChange={(sectionsOther) => onChange({ ...answers, sectionsOther })} /></ChoiceField>
        <ChoiceField implementationKey="core.future_features" title="Plánujete web v budúcnosti rozšíriť?" options={futureOptions} selected={answers.futureFeatures} onChange={(futureFeatures) => onChange({ ...answers, futureFeatures })}><OtherAnswer show={answers.futureFeatures.includes('Iné')} label="Iné rozšírenie" value={answers.futureFeaturesOther} onChange={(futureFeaturesOther) => onChange({ ...answers, futureFeaturesOther })} /></ChoiceField>
        <div className="sm:col-span-2"><Field implementationKey="core.other_sections" multiline label="Je ešte niečo, čo chcete na stránke?" value={answers.otherSections} onChange={(otherSections) => onChange({ ...answers, otherSections })} /></div>
      </Group>}
      <Group id="form-visual" title="Vizuálny smer">
        <div className="sm:col-span-2"><Field implementationKey="core.brand_first_impression" multiline label="Čo chcete, aby si človek o vašej firme pomyslel po 5 sekundách na webe?" hint="Prvá intuitívna reakcia – ešte predtým, než začne čítať detaily." value={answers.brandFirstImpression} onChange={(brandFirstImpression) => onChange({ ...answers, brandFirstImpression })} /></div>
        <ChoiceField implementationKey="core.design_preferences" title="Aké 3–5 slov má vaša značka reprezentovať?" options={includeSavedOptions(brandAttributeOptions, answers.designPreferences)} selected={answers.designPreferences} onChange={(designPreferences) => onChange({ ...answers, designPreferences })}><OtherAnswer show={answers.designPreferences.includes('Iné')} label="Iné slovo" value={answers.designOther} onChange={(designOther) => onChange({ ...answers, designOther })} /></ChoiceField>
        <ChoiceField implementationKey="core.color_preferences" title="Aké farby vám sú blízke?" options={colorOptions} selected={answers.colorPreferences} onChange={(colorPreferences) => onChange({ ...answers, colorPreferences })}><OtherAnswer show={answers.colorPreferences.includes('Iné')} label="Iná farebná preferencia" value={answers.colorPreferencesOther} onChange={(colorPreferencesOther) => onChange({ ...answers, colorPreferencesOther })} /></ChoiceField>
        <ChoiceField implementationKey="core.design_dislikes" title="Čím vaša značka určite nemá byť?" options={dislikeOptions} selected={answers.designDislikes} onChange={(designDislikes) => onChange({ ...answers, designDislikes })}><OtherAnswer show={answers.designDislikes.includes('Iné')} multiline label="Iná neželaná vlastnosť" value={answers.dislikes} onChange={(dislikes) => onChange({ ...answers, dislikes })} /></ChoiceField>
        <div className="sm:col-span-2"><Field implementationKey="core.project_constraints" multiline label="Je niečo, čo musím pri návrhu rešpektovať alebo o čom by som mal vedieť?" value={answers.projectConstraints} onChange={(projectConstraints) => onChange({ ...answers, projectConstraints })} /></div>
        <ListField implementationKey="core.inspiration_urls" label="Weby alebo značky, ktoré sa páčia" value={answers.inspirationUrls} onChange={(inspirationUrls) => onChange({ ...answers, inspirationUrls })} />
        {getAssetUrl && <div className="sm:col-span-2"><div className="mb-3 flex justify-end"><ImplementationToggle fieldKey="core.representative_photos" /></div><RepresentativePhotoPicker assets={assets} getAssetUrl={getAssetUrl} selected={answers.representativePhotoIds} onChange={(representativePhotoIds) => onChange({ ...answers, representativePhotoIds })} /></div>}
      </Group>
      <Group id="form-collaboration" title="Spolupráca">
        <SelectField implementationKey="core.desired_completion" label="Kedy by ste chceli mať svoju webovú stránku hotovú?" options={completionTimeOptions} value={answers.desiredCompletion} onChange={(desiredCompletion) => onChange({ ...answers, desiredCompletion, desiredCompletionDate: desiredCompletion === 'Iný termín.' ? answers.desiredCompletionDate : '' })} />
        {answers.desiredCompletion === 'Iný termín.' && <Field implementationKey="core.desired_completion_date" label="Požadovaný dátum" type="date" value={answers.desiredCompletionDate} onChange={(desiredCompletionDate) => onChange({ ...answers, desiredCompletionDate })} />}
        <SelectField implementationKey="core.website_management" label="Ako by ste chceli riešiť správu webovej stránky po jej spustení?" options={websiteManagementOptions} value={answers.websiteManagement} onChange={(websiteManagement) => onChange({ ...answers, websiteManagement })} />
        <div className="sm:col-span-2"><Field implementationKey="core.collaboration_involvement" multiline label="Ako veľmi chcete byť zapojený do návrhu a jednotlivých rozhodnutí?" value={answers.collaborationInvolvement} onChange={(collaborationInvolvement) => onChange({ ...answers, collaborationInvolvement })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.feedback_communication" multiline label="Ako vám najviac vyhovuje komunikovať a dávať spätnú väzbu?" value={answers.feedbackCommunication} onChange={(feedbackCommunication) => onChange({ ...answers, feedbackCommunication })} /></div>
      </Group>
      <Group id="form-contact" title="Kontakt a fakturácia">
        <Field implementationKey="core.contact_name" hint={hint('contact.name')} label="Kontaktná osoba" value={answers.contact.name} onChange={(name) => emit({ ...answers, contact: { ...answers.contact, name } }, 'contact.name')} />
        <Field implementationKey="core.contact_email" hint={hint('contact.email')} label="E-mail" value={answers.contact.email} onChange={(email) => emit({ ...answers, contact: { ...answers.contact, email } }, 'contact.email')} />
        <Field implementationKey="core.contact_phone" hint={hint('contact.phone')} label="Telefón" value={answers.contact.phone} onChange={(phone) => emit({ ...answers, contact: { ...answers.contact, phone } }, 'contact.phone')} />
        <ChoiceField implementationKey="core.preferred_contacts" title={`Ako vás má zákazník ideálne kontaktovať?${hint('contact.preferredMethods') ? ' · Predvyplnené z predchádzajúcej komunikácie' : ''}`} options={communicationOptions} selected={answers.contact.preferredMethods} onChange={(preferredMethods) => emit({ ...answers, contact: { ...answers.contact, preferredMethods } }, 'contact.preferredMethods')}><OtherAnswer show={answers.contact.preferredMethods.includes('Iné')} label="Iný spôsob kontaktu" value={answers.contact.preferredMethod} onChange={(preferredMethod) => onChange({ ...answers, contact: { ...answers.contact, preferredMethod } })} /></ChoiceField>
        <Field implementationKey="core.business_address" multiline label="Adresa podnikania / prevádzky" value={answers.business.address} onChange={(address) => onChange({ ...answers, business: { ...answers.business, address } })} />
        <Field implementationKey="core.opening_hours" multiline label="Otváracie hodiny" value={answers.business.openingHours} onChange={(openingHours) => onChange({ ...answers, business: { ...answers.business, openingHours } })} />
        <Field implementationKey="core.billing_company_name" label="Fakturačný názov" value={answers.billing.companyName} onChange={(companyName) => onChange({ ...answers, billing: { ...answers.billing, companyName } })} />
        <Field implementationKey="core.billing_company_id" label="IČO" value={answers.billing.companyId} onChange={(companyId) => onChange({ ...answers, billing: { ...answers.billing, companyId } })} />
        <Field implementationKey="core.billing_tax_id" label="DIČ" value={answers.billing.taxId} onChange={(taxId) => onChange({ ...answers, billing: { ...answers.billing, taxId } })} />
        <Field implementationKey="core.billing_vat_id" label="IČ DPH" value={answers.billing.vatId} onChange={(vatId) => onChange({ ...answers, billing: { ...answers.billing, vatId } })} />
        <div className="sm:col-span-2"><Field implementationKey="core.billing_address" multiline label="Fakturačná adresa" value={answers.billing.address} onChange={(address) => onChange({ ...answers, billing: { ...answers.billing, address } })} /></div>
        <div className="sm:col-span-2"><Field implementationKey="core.additional_notes" hint={hint('additionalNotes')} multiline label="Je ešte niečo dôležité, na čo som sa nespýtal a mal by som to pred návrhom webu vedieť?" value={answers.additionalNotes} onChange={(additionalNotes) => emit({ ...answers, additionalNotes }, 'additionalNotes')} /></div>
      </Group>
    </fieldset>
    </ImplementationSelectionContext.Provider>
  )
}

export function DiscoveryWorkspaceFields({ answers, disabled, implementationSelection = {}, onChange, onImplementationSelectionChange }: {
  answers: Discovery2Answers
  disabled?: boolean
  implementationSelection?: ImplementationFieldSelection
  onChange: (answers: Discovery2Answers) => void
  onImplementationSelectionChange?: (fieldKey: ImplementationFieldKey, included: boolean) => void
}) {
  return (
    <ImplementationSelectionContext.Provider value={onImplementationSelectionChange ? { onChange: onImplementationSelectionChange, selection: implementationSelection } : null}>
    <fieldset disabled={disabled} className="space-y-10 disabled:opacity-70">
      <ChoiceField implementationKey="discovery.order_methods" title="Ako dnes zákazník objednáva?" options={orderOptions} selected={answers.order_methods} onChange={(order_methods) => onChange({ ...answers, order_methods })}><OtherAnswer show={answers.order_methods.includes('Iné')} label="Iný spôsob" value={answers.order_methods_other} onChange={(order_methods_other) => onChange({ ...answers, order_methods_other })} /><div className="mt-5"><Field multiline label="Voliteľný opis procesu" value={answers.order_process} onChange={(order_process) => onChange({ ...answers, order_process })} /></div></ChoiceField>
      <div><div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><p className="text-xs font-semibold text-muted-foreground">Produkty, služby a ceny</p><ImplementationToggle fieldKey="discovery.products_and_prices" /></div><ProductPriceList value={answers.products_and_prices} onChange={(products_and_prices) => onChange({ ...answers, products_and_prices })} />{answers.primary_products_and_prices && <div className="mt-5"><Field multiline label="Pôvodná odpoveď" value={answers.primary_products_and_prices} onChange={(primary_products_and_prices) => onChange({ ...answers, primary_products_and_prices })} /></div>}</div>
      <ChoiceField implementationKey="discovery.personalization" title="Čo môže zákazník prispôsobiť?" options={personalizationOptions} selected={answers.personalization_choices} onChange={(personalization_choices) => onChange({ ...answers, personalization_choices })}><OtherAnswer show={answers.personalization_choices.includes('Iné')} label="Iná možnosť" value={answers.personalization_options} onChange={(personalization_options) => onChange({ ...answers, personalization_options })} /></ChoiceField>
      <ChoiceField implementationKey="discovery.customer_appreciation" title="Čo zákazníci najviac oceňujú?" options={appreciationOptions} selected={answers.customer_appreciation_choices} onChange={(customer_appreciation_choices) => onChange({ ...answers, customer_appreciation_choices })}><OtherAnswer show={answers.customer_appreciation_choices.includes('Iné')} label="Čo ešte oceňujú" value={answers.customer_appreciation} onChange={(customer_appreciation) => onChange({ ...answers, customer_appreciation })} /><div className="mt-5"><Field multiline label="Konkrétna reakcia zákazníka" value={answers.customer_quote} onChange={(customer_quote) => onChange({ ...answers, customer_quote })} /></div></ChoiceField>
      <ChoiceField implementationKey="discovery.frequent_questions" title="Čo sa zákazníci najčastejšie pýtajú?" options={frequentQuestionOptions} selected={answers.frequent_questions} onChange={(frequent_questions) => onChange({ ...answers, frequent_questions })}><OtherAnswer show={answers.frequent_questions.includes('Iné')} multiline label="Iná otázka" value={answers.frequent_questions_other} onChange={(frequent_questions_other) => onChange({ ...answers, frequent_questions_other })} /></ChoiceField>
      <ChoiceField implementationKey="discovery.must_show" title="Čo musí byť na novom webe určite?" options={mustShowOptions} selected={answers.must_show_choices} onChange={(must_show_choices) => onChange({ ...answers, must_show_choices })}><OtherAnswer show={answers.must_show_choices.includes('Iné')} multiline label="Čo ešte musí byť na webe" value={answers.must_show_on_website} onChange={(must_show_on_website) => onChange({ ...answers, must_show_on_website })} /></ChoiceField>
    </fieldset>
    </ImplementationSelectionContext.Provider>
  )
}

export function MetaAdsWorkspaceFields({ actor, answers, disabled, onChange }: {
  actor?: 'client'
  answers: OnboardingAnswers
  disabled?: boolean
  onChange: (answers: OnboardingAnswers) => void
}) {
  function emit(next: OnboardingAnswers, key?: PrefillFieldKey) {
    onChange(actor === 'client' && key ? markClientFieldChange(next, key) : next)
  }
  const hint = (key: PrefillFieldKey) => actor === 'client' && isUnconfirmedPrefill(answers, key)
    ? 'Predvyplnené z predchádzajúcej komunikácie'
    : undefined
  const campaign = answers.metaCampaign
  const updateCampaign = (updates: Partial<OnboardingAnswers['metaCampaign']>) => {
    onChange({ ...answers, metaCampaign: { ...campaign, ...updates } })
  }

  return (
    <fieldset disabled={disabled} className="space-y-10 disabled:opacity-70">
      <Group title="O vás a vašom podnikaní">
        <Field hint={hint('client.displayName')} label="Meno / názov podnikania" value={answers.client.displayName} onChange={(displayName) => emit({ ...answers, client: { displayName } }, 'client.displayName')} />
        <Field hint={hint('business.area')} label="Čomu sa venujete" value={answers.business.area} onChange={(area) => emit({ ...answers, business: { ...answers.business, area } }, 'business.area')} />
        <div className="sm:col-span-2"><Field multiline label="Stručne opíšte svoje podnikanie a čo ponúkate." hint="Stačí pár viet, aby som pochopil váš biznis a zákazníkov." value={answers.business.description} onChange={(description) => onChange({ ...answers, business: { ...answers.business, description } })} /></div>
        <SocialLinksField answers={answers} hint={hint('socialLinks')} onChange={(next) => emit(next, 'socialLinks')} />
      </Group>

      <Group title="Cieľ kampane a ponuka">
        <SelectField label="Kde chcete inzerovať?" options={campaignPlatformOptions} value={campaign.platforms[0] || ''} onChange={(value) => updateCampaign({ platforms: value ? [value] : [] })} />
        <ChoiceField title="Čo má kampaň priniesť?" options={campaignGoalOptions} selected={campaign.goals} onChange={(goals) => updateCampaign({ goals })}>
          <OtherAnswer show={campaign.goals.includes('Iné / ešte neviem')} label="Čo chcete dosiahnuť alebo s čím si nie ste istý" value={campaign.goalsOther} onChange={(goalsOther) => updateCampaign({ goalsOther })} />
        </ChoiceField>
        <div className="sm:col-span-2"><Field multiline label="Čo konkrétne chcete propagovať?" hint="Produkt, služba, balík, akcia alebo ponuka. Uveďte aj to, čo má byť hlavnou výhodou." value={campaign.offer} onChange={(offer) => updateCampaign({ offer })} /></div>
        <Field label="Cena propagovanej ponuky" hint="Napr. 49 €, od 300 € alebo individuálna cena." value={campaign.offerPrice} onChange={(offerPrice) => updateCampaign({ offerPrice })} />
        <Field multiline label="Akú hodnotu alebo výhodu dostane zákazník?" hint="Prečo by mal reagovať práve na túto ponuku?" value={campaign.customerValue} onChange={(customerValue) => updateCampaign({ customerValue })} />
        <ChoiceField title="Kam má reklama človeka priviesť alebo čo má urobiť?" options={campaignDestinationOptions} selected={campaign.destinationTypes} onChange={(destinationTypes) => updateCampaign({ destinationTypes })}>
          <div className="mt-5"><Field label="Odkaz na cieľovú stránku, web alebo e-shop" hint="Ak ešte neexistuje, nechajte pole prázdne." value={campaign.destinationUrl} onChange={(destinationUrl) => updateCampaign({ destinationUrl })} /></div>
        </ChoiceField>
      </Group>

      <Group title="Ideálny zákazník">
        <div className="sm:col-span-2"><Field multiline label="Koho chcete reklamou osloviť?" hint="Kto je ideálny zákazník, čo rieši a prečo by ho ponuka mala zaujímať?" value={campaign.audience} onChange={(audience) => updateCampaign({ audience })} /></div>
        <Field label="Kde sa zákazníci nachádzajú?" hint="Mesto, región, celé Slovensko alebo konkrétne krajiny." value={campaign.locations} onChange={(locations) => updateCampaign({ locations })} />
        <Field multiline label="Máte existujúce publikum alebo databázu?" hint="Napr. návštevníci webu, zákaznícky zoznam, sledovatelia alebo podobné publikum." value={campaign.existingAudience} onChange={(existingAudience) => updateCampaign({ existingAudience })} />
      </Group>

      <Group title="Rozsah, rozpočet a termín">
        <SelectField label="Mesačný rozpočet len na reklamu" hint="Bez ceny za prípravu a správu kampane." options={campaignBudgetOptions} value={campaign.monthlyAdBudget} onChange={(monthlyAdBudget) => updateCampaign({ monthlyAdBudget })} />
        <Field label="Koľko ponúk chcete naraz propagovať?" hint="Napr. jeden produkt, tri služby alebo viac samostatných kampaní." value={campaign.numberOfOffers} onChange={(numberOfOffers) => updateCampaign({ numberOfOffers })} />
        <SelectField label="Ako dlho má kampaň bežať?" options={campaignDurationOptions} value={campaign.duration} onChange={(duration) => updateCampaign({ duration })} />
        <Field label="Kedy chcete kampaň spustiť?" hint="Uveďte dátum alebo približný termín." value={campaign.desiredStart} onChange={(desiredStart) => updateCampaign({ desiredStart })} />
        <ChoiceField title="S čím všetkým potrebujete pomôcť?" options={campaignServiceOptions} selected={campaign.servicesNeeded} onChange={(servicesNeeded) => updateCampaign({ servicesNeeded })} />
      </Group>

      <Group title="Podklady a technické nastavenie">
        <ChoiceField title="Čo už máte pripravené?" options={campaignAssetOptions} selected={campaign.availableAssets} onChange={(availableAssets) => updateCampaign({ availableAssets })}>
          <OtherAnswer show={campaign.availableAssets.includes('Iné')} label="Ďalšie pripravené podklady" value={campaign.availableAssetsOther} onChange={(availableAssetsOther) => updateCampaign({ availableAssetsOther })} />
        </ChoiceField>
        <SelectField label="Stav Meta účtov" options={campaignMetaSetupOptions} value={campaign.metaSetupStatus} onChange={(metaSetupStatus) => updateCampaign({ metaSetupStatus })} />
        <SelectField label="Meranie výsledkov na webe" options={campaignTrackingOptions} value={campaign.trackingStatus} onChange={(trackingStatus) => updateCampaign({ trackingStatus })} />
        <SelectField label="Mali ste už platené kampane?" options={previousCampaignOptions} value={campaign.previousCampaignStatus} onChange={(previousCampaignStatus) => updateCampaign({ previousCampaignStatus })} />
        {campaign.previousCampaignStatus === 'Áno, kampane bežali alebo bežia' && <div className="sm:col-span-2"><Field multiline label="Čo sa v minulých kampaniach dialo?" hint="Čo fungovalo, čo nie a aké boli približné výsledky alebo náklady." value={campaign.previousCampaignDetails} onChange={(previousCampaignDetails) => updateCampaign({ previousCampaignDetails })} /></div>}
      </Group>

      <Group title="Výsledok a dôležité obmedzenia">
        <div className="sm:col-span-2"><Field multiline label="Podľa čoho spoznáte, že je kampaň úspešná?" hint="Napr. počet dopytov, predajov, rezervácií alebo návštev prevádzky." value={campaign.successDefinition} onChange={(successDefinition) => updateCampaign({ successDefinition })} /></div>
        <Field label="Akú hodnotu má pre vás jeden výsledok?" hint="Ak viete: cieľová cena za dopyt, objednávku alebo návratnosť." value={campaign.targetCostPerResult} onChange={(targetCostPerResult) => updateCampaign({ targetCostPerResult })} />
        <Field label="Koľko nových dopytov alebo objednávok viete spracovať?" hint="Pomôže nastaviť realistický rozsah kampane." value={campaign.leadCapacity} onChange={(leadCapacity) => updateCampaign({ leadCapacity })} />
        <div className="sm:col-span-2"><Field multiline label="Čo musím pri reklame rešpektovať?" hint="Povinné informácie, zakázané tvrdenia, citlivé témy, schvaľovanie alebo sezónne obmedzenia." value={campaign.restrictions} onChange={(restrictions) => updateCampaign({ restrictions })} /></div>
      </Group>

      <Group title="Kontakt a fakturácia">
        <Field hint={hint('contact.name')} label="Kontaktná osoba" value={answers.contact.name} onChange={(name) => emit({ ...answers, contact: { ...answers.contact, name } }, 'contact.name')} />
        <Field hint={hint('contact.email')} label="E-mail" value={answers.contact.email} onChange={(email) => emit({ ...answers, contact: { ...answers.contact, email } }, 'contact.email')} />
        <Field hint={hint('contact.phone')} label="Telefón" value={answers.contact.phone} onChange={(phone) => emit({ ...answers, contact: { ...answers.contact, phone } }, 'contact.phone')} />
        <Field label="Fakturačný názov" value={answers.billing.companyName} onChange={(companyName) => onChange({ ...answers, billing: { ...answers.billing, companyName } })} />
        <Field label="IČO" value={answers.billing.companyId} onChange={(companyId) => onChange({ ...answers, billing: { ...answers.billing, companyId } })} />
        <Field label="DIČ" value={answers.billing.taxId} onChange={(taxId) => onChange({ ...answers, billing: { ...answers.billing, taxId } })} />
        <Field label="IČ DPH" value={answers.billing.vatId} onChange={(vatId) => onChange({ ...answers, billing: { ...answers.billing, vatId } })} />
        <div className="sm:col-span-2"><Field multiline label="Fakturačná adresa" value={answers.billing.address} onChange={(address) => onChange({ ...answers, billing: { ...answers.billing, address } })} /></div>
        <div className="sm:col-span-2"><Field hint={hint('additionalNotes')} multiline label="Je ešte niečo dôležité, čo by som mal o kampani vedieť?" value={answers.additionalNotes} onChange={(additionalNotes) => emit({ ...answers, additionalNotes }, 'additionalNotes')} /></div>
      </Group>
    </fieldset>
  )
}
