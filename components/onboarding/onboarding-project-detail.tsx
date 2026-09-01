import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, Download, ExternalLink, FileText, ImageIcon, Mail, Phone } from 'lucide-react'
import { Discovery2Admin } from '@/components/onboarding/discovery-2-admin'
import { LogoMark } from '@/components/logo'
import type { Discovery2Record } from '@/lib/onboarding/discovery'
import type { OnboardingAnswers, OnboardingAsset, OnboardingStatus } from '@/lib/onboarding/types'

const statusLabel: Record<OnboardingStatus, string> = {
  not_started: 'Nezačaté',
  in_progress: 'Rozpracované',
  submitted: 'Odoslané',
}

const navigation = [
  ['overview', 'Prehľad'],
  ['core', 'Základný formulár'],
  ['discovery-2', 'Doplňujúce otázky'],
  ['files', 'Súbory / fotografie'],
  ['creative-strategy', 'Kreatívna stratégia'],
  ['creative-directions', 'Kreatívne smery'],
  ['notes', 'Poznámky'],
] as const

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('sk-SK', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Bratislava',
  }).format(new Date(value))
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

function externalUrl(value: string) {
  if (!value) return null
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function Answer({ children, label }: { children?: React.ReactNode; label: string }) {
  const hasValue = children !== undefined && children !== null && children !== ''
  return (
    <div>
      <dt className="text-xs font-medium leading-5 text-muted-foreground">{label}</dt>
      <dd className={`mt-1.5 whitespace-pre-wrap text-sm leading-6 ${hasValue ? 'text-foreground' : 'text-muted-foreground/70'}`}>
        {hasValue ? children : 'Neuvedené'}
      </dd>
    </div>
  )
}

function SelectionList({ values }: { values: string[] }) {
  if (!values.length) return <span className="text-muted-foreground/70">Neuvedené</span>
  return <ul className="space-y-1.5">{values.map((value) => <li key={value} className="flex items-start gap-2"><Check className="mt-1 size-3.5 shrink-0 text-brand" /><span>{value}</span></li>)}</ul>
}

function ExternalAnswer({ label, value }: { label: string; value: string }) {
  const href = externalUrl(value)
  return <Answer label={label}>{href ? <a href={href} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className="inline-flex max-w-full items-center gap-1.5 break-all font-medium text-brand hover:underline">{value}<ExternalLink className="size-3.5 shrink-0" /></a> : value}</Answer>
}

function CoreStep({ children, number, title }: { children: React.ReactNode; number: number; title: string }) {
  return (
    <section className="grid gap-6 border-t border-border/80 py-9 sm:grid-cols-[9rem_1fr] sm:gap-10">
      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Krok {number}</p><h3 className="mt-2 text-lg font-semibold tracking-[-0.025em]">{title}</h3></div>
      <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

function PageSection({ children, id, title, text }: { children: React.ReactNode; id: string; title: string; text?: string }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-border py-12 sm:py-16">
      <h2 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h2>
      {text && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{text}</p>}
      <div className="mt-8">{children}</div>
    </section>
  )
}

function EmptySection({ children }: { children: React.ReactNode }) {
  return <p className="max-w-xl text-sm leading-6 text-muted-foreground">{children}</p>
}

export function OnboardingProjectDetail({ answers, assets, discovery, project }: {
  answers: OnboardingAnswers
  assets: OnboardingAsset[]
  discovery: Discovery2Record | null
  project: {
    clientLabel: string
    createdAt: Date
    currentStep: number
    id: string
    lastActivityAt: Date
    status: OnboardingStatus
    submittedAt: Date | null
  }
}) {
  const progress = Math.round((project.currentStep / 6) * 100)
  const uploadedAssets = assets.filter((asset) => asset.status === 'uploaded')
  const images = uploadedAssets.filter((asset) => asset.mimeType.startsWith('image/'))
  const documents = uploadedAssets.filter((asset) => !asset.mimeType.startsWith('image/'))

  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/start" aria-label="Späť na klientov" className="inline-flex"><LogoMark /></Link>
        <Link href="/start" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Všetci klienti</Link>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Detail klienta</p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0"><h1 className="break-words text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{project.clientLabel}</h1><p className="mt-3 text-sm text-muted-foreground">Posledná aktivita {formatDate(project.lastActivityAt)}</p></div>
          <div className={`inline-flex shrink-0 items-center gap-2 text-sm font-semibold ${project.status === 'submitted' ? 'text-emerald-700' : project.status === 'in_progress' ? 'text-brand' : 'text-muted-foreground'}`}><span className="size-2 rounded-full bg-current" />Základný formulár: {statusLabel[project.status]}</div>
        </div>

        <nav aria-label="Sekcie klienta" className="sticky top-0 z-10 -mx-5 mt-10 overflow-x-auto border-y border-border/70 bg-background/95 px-5 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex min-w-max gap-6">{navigation.map(([id, label]) => <a key={id} href={`#${id}`} className="py-4 text-sm font-medium text-muted-foreground hover:text-brand focus-visible:text-brand">{label}</a>)}</div>
        </nav>

        <PageSection id="overview" title="Prehľad">
          <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            <Answer label="Vytvorené">{formatDate(project.createdAt)}</Answer>
            <Answer label="Základný formulár">{statusLabel[project.status]} · {progress} %</Answer>
            <Answer label="Doplňujúce otázky">{discovery ? `${statusLabel[discovery.status]} · ${discovery.currentStep}. krok zo 6` : 'Link ešte nebol vytvorený'}</Answer>
            <Answer label="Súbory">{uploadedAssets.length ? `${uploadedAssets.length} nahraných` : 'Žiadne nahrané súbory'}</Answer>
          </dl>
        </PageSection>

        <PageSection id="core" title="Základný formulár" text="Pôvodný onboarding klienta. Existujúce otázky a odpovede zostávajú zachované.">
          <CoreStep number={1} title="O klientovi">
            <Answer label="Meno / názov podnikania">{answers.client.displayName}</Answer><Answer label="Čomu sa venuje">{answers.business.area}</Answer>
            <Answer label="Typ projektu">{answers.projectType}</Answer>
            <div className="sm:col-span-2"><Answer label="Ako opisuje svoju prácu">{answers.business.description}</Answer></div>
            <ExternalAnswer label="Existujúci web" value={answers.existingWebsite} />
            <Answer label="Sociálne siete">{answers.socialLinks.length ? <span className="space-y-1.5">{answers.socialLinks.map((value, index) => { const href = externalUrl(value); const label = [answers.socialPlatforms[index], value].filter(Boolean).join(': '); return href ? <a key={`${value}-${index}`} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 break-all font-medium text-brand hover:underline">{label}<ExternalLink className="size-3.5" /></a> : <span key={`${value}-${index}`} className="block">{label}</span> })}</span> : ''}</Answer>
          </CoreStep>
          <CoreStep number={2} title="Zákazníci a cieľ">
            <Answer label="Najčastejší zákazníci"><SelectionList values={[...answers.targetAudienceSelections, ...(answers.targetAudience ? [answers.targetAudience] : [])]} /></Answer>
            <Answer label="Očakávania od webu"><SelectionList values={[...answers.websiteExpectations, ...(answers.websiteExpectationsOther ? [answers.websiteExpectationsOther] : [])]} /></Answer>
            <Answer label="Čo sa má návštevník dozvedieť"><SelectionList values={[...answers.websiteInformation, ...(answers.websiteGoal ? [answers.websiteGoal] : [])]} /></Answer>
            <Answer label="Čo má návštevník urobiť"><SelectionList values={[...answers.desiredActions, ...(answers.desiredActionsOther ? [answers.desiredActionsOther] : [])]} /></Answer>
            <Answer label="Typ ponuky"><SelectionList values={[...answers.offeringTypes, ...(answers.services ? [answers.services] : [])]} /></Answer>
            <Answer label="Konkrétne produkty / služby"><SelectionList values={answers.offerItems} /></Answer>
          </CoreStep>
          <CoreStep number={3} title="Obsah stránky">
            <Answer label="Časti stránky"><SelectionList values={[...answers.sections, ...(answers.sectionsOther ? [answers.sectionsOther] : [])]} /></Answer><Answer label="Budúce rozšírenia"><SelectionList values={[...answers.futureFeatures, ...(answers.futureFeaturesOther ? [answers.futureFeaturesOther] : [])]} /></Answer><div className="sm:col-span-2"><Answer label="Ďalšie požiadavky">{answers.otherSections}</Answer></div>
          </CoreStep>
          <CoreStep number={4} title="Vizuálny smer">
            <Answer label="Ako má web pôsobiť"><SelectionList values={[...answers.designPreferences, ...(answers.designOther ? [answers.designOther] : [])]} /></Answer><Answer label="Farebné preferencie"><SelectionList values={[...answers.colorPreferences, ...(answers.colorPreferencesOther ? [answers.colorPreferencesOther] : [])]} /></Answer><Answer label="Čomu sa vyhnúť"><SelectionList values={[...answers.designDislikes, ...(answers.dislikes ? [answers.dislikes] : [])]} /></Answer>
            <div className="sm:col-span-2"><Answer label="Inšpirácie">{answers.inspirationUrls.length ? <span className="space-y-1.5">{answers.inspirationUrls.map((value) => { const href = externalUrl(value); return href ? <a key={value} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 break-all font-medium text-brand hover:underline">{value}<ExternalLink className="size-3.5" /></a> : <span key={value} className="block">{value}</span> })}</span> : ''}</Answer></div>
          </CoreStep>
          <CoreStep number={5} title="Materiály"><div className="sm:col-span-2"><Answer label="Nahrané podklady">{uploadedAssets.length ? `${uploadedAssets.length} súborov — nájdete ich v sekcii Súbory / fotografie.` : ''}</Answer></div></CoreStep>
          <CoreStep number={6} title="Kontakt a dokončenie">
            <Answer label="Kontaktná osoba">{answers.contact.name}</Answer><Answer label="Ideálny kontakt zákazníka"><SelectionList values={[...answers.contact.preferredMethods, ...(answers.contact.preferredMethod ? [answers.contact.preferredMethod] : [])]} /></Answer>
            <Answer label="E-mail">{answers.contact.email ? <a href={`mailto:${answers.contact.email}`} className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"><Mail className="size-3.5" />{answers.contact.email}</a> : ''}</Answer>
            <Answer label="Telefón">{answers.contact.phone ? <a href={`tel:${answers.contact.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"><Phone className="size-3.5" />{answers.contact.phone}</a> : ''}</Answer>
            <Answer label="Fakturačný názov">{answers.billing.companyName}</Answer><Answer label="IČO / DIČ / IČ DPH">{[answers.billing.companyId, answers.billing.taxId, answers.billing.vatId].filter(Boolean).join(' · ')}</Answer>
            <div className="sm:col-span-2"><Answer label="Fakturačná adresa">{answers.billing.address}</Answer></div><div className="sm:col-span-2"><Answer label="Ďalšie poznámky">{answers.additionalNotes}</Answer></div>
          </CoreStep>
        </PageSection>

        <PageSection id="discovery-2" title="Doplňujúce otázky" text="Samostatný doplňujúci formulár s vlastným osobným linkom.">
          <Discovery2Admin clientId={project.id} exists={Boolean(discovery)} />
          {discovery && <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <Answer label="Ako dnes zákazník objednáva"><SelectionList values={[...discovery.order_methods, ...(discovery.order_methods_other ? [discovery.order_methods_other] : [])]} /></Answer>
            <Answer label="Opis procesu">{discovery.order_process}</Answer>
            <div className="sm:col-span-2"><Answer label="Produkty, služby a ceny"><SelectionList values={[...discovery.products_and_prices.map((item) => [item.name, item.type, item.priceType, item.price, item.note].filter(Boolean).join(' · ')), ...(discovery.primary_products_and_prices ? [discovery.primary_products_and_prices] : [])]} /></Answer></div>
            <Answer label="Čo môže zákazník prispôsobiť"><SelectionList values={[...discovery.personalization_choices, ...(discovery.personalization_options ? [discovery.personalization_options] : [])]} /></Answer>
            <Answer label="Čo zákazníci oceňujú"><SelectionList values={[...discovery.customer_appreciation_choices, ...(discovery.customer_appreciation ? [discovery.customer_appreciation] : [])]} /></Answer>
            <Answer label="Konkrétna reakcia zákazníka">{discovery.customer_quote}</Answer>
            <Answer label="Časté otázky"><SelectionList values={[...discovery.frequent_questions, ...(discovery.frequent_questions_other ? [discovery.frequent_questions_other] : [])]} /></Answer>
            <div className="sm:col-span-2"><Answer label="Čo musí byť na webe"><SelectionList values={[...discovery.must_show_choices, ...(discovery.must_show_on_website ? [discovery.must_show_on_website] : [])]} /></Answer></div>
          </dl>}
        </PageSection>

        <PageSection id="files" title="Súbory / fotografie" text="Obrázky sú zobrazené v galérii, ostatné podklady samostatne.">
          {images.length > 0 && <><h3 className="text-sm font-semibold">Fotografie</h3><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{images.map((asset) => <a key={asset.id} href={`/api/onboarding/admin/projects/${project.id}/assets/${asset.id}`} className="group block" aria-label={`Stiahnuť ${asset.name}`}><span className="relative block aspect-square overflow-hidden bg-secondary"><Image unoptimized fill sizes="(min-width: 1024px) 256px, (min-width: 640px) 33vw, 50vw" src={`/api/onboarding/admin/projects/${project.id}/assets/${asset.id}?preview=1`} alt={asset.name} className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /></span><span className="mt-2 block truncate text-xs font-medium">{asset.name}</span></a>)}</div></>}
          {documents.length > 0 && <div className={images.length ? 'mt-10' : ''}><h3 className="text-sm font-semibold">Dokumenty</h3><ul className="mt-3 divide-y divide-border/70">{documents.map((asset) => <li key={asset.id} className="flex items-center gap-3 py-3"><FileText className="size-5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{asset.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{formatBytes(asset.size)} · {formatDate(asset.createdAt)}</span></span><a href={`/api/onboarding/admin/projects/${project.id}/assets/${asset.id}`} aria-label={`Stiahnuť ${asset.name}`} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-brand"><Download className="size-4" /></a></li>)}</ul></div>}
          {!uploadedAssets.length && <div className="flex items-center gap-3 text-sm text-muted-foreground"><ImageIcon className="size-5" />Klient zatiaľ nenahral žiadne súbory.</div>}
        </PageSection>

        <PageSection id="creative-strategy" title="Kreatívna stratégia"><EmptySection>Priestor je pripravený. Kreatívna stratégia zatiaľ nemá pridaný obsah.</EmptySection></PageSection>
        <PageSection id="creative-directions" title="Kreatívne smery"><EmptySection>Priestor je pripravený. Kreatívne smery zatiaľ nemajú pridaný obsah.</EmptySection></PageSection>
        <PageSection id="notes" title="Poznámky"><EmptySection>Poznámky zatiaľ nemajú samostatný obsah. Pôvodné poznámky zo základného formulára zostávajú zobrazené v jeho poslednom kroku.</EmptySection></PageSection>
      </div>
    </main>
  )
}
