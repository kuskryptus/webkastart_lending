'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AppWindow,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Globe2,
  HelpCircle,
  MousePointerClick,
  Sparkles,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { ContactFormLink } from '@/components/contact-form-link'
import { SectionLabel } from '@/components/section-label'

type Solution = {
  id: string
  choice: string
  mobileChoice: string
  icon: LucideIcon
  title: string
  description: string
  mobileDescription: string
  price?: string
  items?: string[]
  mobileItems?: string[]
  timeframe?: string
  note?: string
  cta: string
}

const solutions: Solution[] = [
  {
    id: 'uprava-webu',
    choice: 'Vylepšiť existujúci web',
    mobileChoice: 'Vylepšiť web',
    icon: Wrench,
    title: 'Úpravy existujúceho webu',
    description:
      'Máte web, no niečo na ňom nefunguje tak, ako má? Opravím ho, zrýchlim alebo upravím tak, aby sa ľudia ľahšie dostali ku kontaktu.',
    mobileDescription: 'Opravy, zrýchlenie a praktické úpravy vášho webu.',
    price: '150 – 500 €',
    items: [
      'Úpravy dizajnu a obsahu',
      'Mobilná a tabletová verzia',
      'Jasnejšie tlačidlá a kontakt',
      'Technické opravy',
      'Optimalizácia rýchlosti',
    ],
    mobileItems: [
      'Úpravy dizajnu a obsahu',
      'Mobilná a tabletová verzia',
      'Jasnejšie tlačidlá a kontakt',
      'Technické opravy',
    ],
    note: 'Väčšie zásahy a nové funkcie nacením zvlášť.',
    cta: 'Prebrať úpravy webu',
  },
  {
    id: 'viac-dopytov',
    choice: 'Získať viac dopytov',
    mobileChoice: 'Viac dopytov',
    icon: MousePointerClick,
    title: 'Landing page',
    description:
      'Chcete predstaviť jednu službu alebo spúšťate reklamu? Pripravím stránku, ktorá návštevníka jasne dovedie k dopytu.',
    mobileDescription: 'Samostatná stránka pre jednu službu alebo reklamnú kampaň.',
    price: '500 – 800 €',
    items: [
      'Návrh obsahu a štruktúry',
      'Responzívny dizajn',
      'Kontaktný formulár',
      'Meranie návštevnosti',
      'Základné SEO',
      'Prepojenie s vašimi nástrojmi',
    ],
    mobileItems: [
      'Responzívny dizajn',
      'Kontaktný formulár',
      'Meranie návštevnosti',
      'Základné SEO',
    ],
    timeframe: 'orientačne 1–2 týždne',
    cta: 'Prebrať môj projekt',
  },
  {
    id: 'novy-web',
    choice: 'Vytvoriť nový web',
    mobileChoice: 'Nový web',
    icon: Globe2,
    title: 'Firemný web',
    description:
      'Ak potrebujete nový web, navrhnem ho tak, aby ľudia rýchlo pochopili, čo robíte a ako vás môžu kontaktovať.',
    mobileDescription: 'Nový firemný web, na ktorom sa ľudia rýchlo zorientujú.',
    price: '900 – 1 800 €',
    items: [
      'Návrh štruktúry webu',
      'Viaceré podstránky',
      'Responzívny dizajn',
      'Kontaktné a dopytové formuláre',
      'Základné SEO a analytika',
    ],
    mobileItems: [
      'Návrh štruktúry webu',
      'Responzívny dizajn',
      'Kontaktné a dopytové formuláre',
      'Základné SEO a analytika',
    ],
    note: 'Cenu ovplyvní najmä počet podstránok, pripravený obsah a potrebné prepojenia.',
    cta: 'Prebrať nový web',
  },
  {
    id: 'aplikacia',
    choice: 'Vytvoriť aplikáciu',
    mobileChoice: 'Aplikácia',
    icon: AppWindow,
    title: 'Webová aplikácia na mieru',
    description:
      'Potrebujete rezervačný systém, klientsku zónu alebo interný nástroj? Navrhnem ho podľa toho, ako vaša firma naozaj funguje.',
    mobileDescription: 'Nástroj pre zákazníkov alebo každodennú prácu vo firme.',
    price: '1 000 – 3 000+ €',
    items: [
      'Rezervačné systémy a kalkulačky',
      'Konfigurátory a klientske zóny',
      'Dashboardy a interné systémy',
      'Databázové aplikácie',
      'API integrácie a administrácia',
    ],
    mobileItems: [
      'Rezervačné systémy a kalkulačky',
      'Konfigurátory a klientske zóny',
      'Dashboardy a interné systémy',
      'API integrácie a administrácia',
    ],
    note: 'Pri väčších aplikáciách cenu určíme podľa funkcií, dát a potrebných prepojení.',
    cta: 'Prebrať aplikáciu',
  },
  {
    id: 'automatizacia',
    choice: 'Automatizovať proces',
    mobileChoice: 'AI & automatizácia',
    icon: Bot,
    title: 'AI & automatizácie',
    description:
      'Ak vo firme stále opakujete tie isté kroky, môžeme ich prepojiť a automatizovať. Ušetríte čas a výsledok budete mať stále pod kontrolou.',
    mobileDescription: 'Menej ručného prepisovania a opakovaných úloh.',
    price: '500 – 2 000+ €',
    items: [
      'Spracovanie formulárov a následná komunikácia',
      'AI asistenti a spracovanie dát',
      'Prepojenie s CRM',
      'Automatické reporty',
      'Prepojenie vašich systémov',
    ],
    mobileItems: [
      'Formuláre a následná komunikácia',
      'AI asistenti a spracovanie dát',
      'Prepojenie s CRM',
      'Automatické reporty',
    ],
    note: 'Cenu ovplyvní počet krokov, prepojení a stav vašich vstupných dát.',
    cta: 'Prebrať automatizáciu',
  },
  {
    id: 'poradit',
    choice: 'Neviem – poraďte mi',
    mobileChoice: 'Neviem, poraďte mi',
    icon: HelpCircle,
    title: 'Najprv problém, potom riešenie',
    description:
      'Nemusíte vedieť, či potrebujete nový web, aplikáciu alebo automatizáciu. Povedzte mi, čo vás brzdí a čo chcete dosiahnuť. Možnosti prejdeme spolu.',
    mobileDescription: 'Stačí mi povedať, čo vás brzdí a čo chcete dosiahnuť.',
    note: 'Technické riešenie nemusíte poznať vopred.',
    cta: 'Prebrať, čo potrebujem',
  },
]

const hourlyExamples = [
  'Úpravy webu',
  'Oprava chyby',
  'Nová funkcia',
  'Konzultácia',
  'Prepojenie systémov',
  'Technická pomoc',
]

const pricingSteps = [
  {
    number: '01',
    title: 'Poviete mi, čo potrebujete',
    description: 'Stačí vedieť, čo chcete zlepšiť a kam sa chcete dostať.',
  },
  {
    number: '02',
    title: 'Poviem vám odhad',
    description: 'Ešte pred začiatkom budete vedieť, koľko času a peňazí si práca asi vyžiada.',
  },
  {
    number: '03',
    title: 'Po vašom súhlase začnem',
    description: 'Do práce sa pustím až vtedy, keď vám rozsah aj odhad vyhovujú.',
  },
]

export function Pricing() {
  const [selectedId, setSelectedId] = useState('viac-dopytov')
  const selected = solutions.find((solution) => solution.id === selectedId) ?? solutions[1]
  const SelectedIcon = selected.icon
  const mobileItems = selected.mobileItems ?? selected.items?.slice(0, 4) ?? []
  const detailItems = selected.items?.filter((item) => !mobileItems.includes(item)) ?? []

  return (
    <section id="sluzby" className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <SectionLabel>Služby</SectionLabel>
        <h2 id="solution-question" className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Čo potrebujete vyriešiť?
        </h2>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          <span className="sm:hidden">
            Vyberte, čo potrebujete. Hneď uvidíte vhodné riešenie a orientačnú cenu.
          </span>
          <span className="hidden sm:inline">
            Vyberte možnosť, ktorá najlepšie vystihuje, čo potrebujete. Hneď uvidíte
            moje odporúčanie, orientačnú cenu a čo je v nej.
          </span>
        </p>
      </div>

      <aside
        aria-labelledby="pricing-process-title"
        className="mt-9 hidden rounded-2xl border border-brand/15 bg-card p-7 shadow-card lg:block"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Ako to bude prebiehať</p>
            <h3 id="pricing-process-title" className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              Najprv sa dohodneme, potom začnem
            </h3>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-right">
            Cena sa odvíja od rozsahu, funkcií a toho, čo už máte pripravené.
          </p>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {pricingSteps.map((step) => (
            <li
              key={step.number}
              className="group flex gap-3 rounded-xl bg-brand-soft/45 p-3.5 transition-colors hover:bg-brand-soft/70 motion-reduce:transition-none"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-xs font-bold text-brand shadow-sm">
                {step.number}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground sm:block">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 grid gap-4 border-t border-border pt-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Máte jasnú predstavu? Super.</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Čím viac si ujasníme na začiatku, tým menej času zaberú zmeny počas práce
                a tým nižšia môže byť výsledná cena.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-brand/10 bg-brand-soft/45 px-4 py-3.5">
            <p className="text-sm font-semibold text-foreground">Nemáte ešte presnú predstavu? To vôbec nevadí.</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Povedzte mi, čo nefunguje a čo chcete dosiahnuť. Riešenie vymyslíme spolu.
            </p>
          </div>
        </div>
      </aside>

      <div className="mt-6 overflow-hidden rounded-3xl border border-brand/15 bg-brand-soft/35 shadow-card sm:mt-10 lg:grid lg:grid-cols-[0.78fr_1.22fr]">
        <div className="p-3 sm:p-6 lg:p-8">
          <p className="hidden px-2 text-sm font-semibold text-foreground sm:block">Čo chcete vyriešiť?</p>
          <div
            role="group"
            aria-labelledby="solution-question"
            className="grid grid-cols-2 gap-2 sm:mt-4 sm:gap-2.5 lg:grid-cols-1"
          >
            {solutions.map((solution) => {
              const active = solution.id === selected.id
              const ChoiceIcon = solution.icon

              return (
                <button
                  key={solution.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedId(solution.id)}
                  className={`group flex min-h-11 w-full items-center justify-center rounded-full border px-3 py-2 text-center text-xs font-medium leading-snug transition duration-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 motion-reduce:transition-none sm:min-h-14 sm:justify-start sm:gap-3 sm:rounded-xl sm:px-3.5 sm:py-3 sm:text-left sm:text-sm ${
                    active
                      ? 'border-brand/30 bg-card text-foreground shadow-sm'
                      : 'border-transparent text-muted-foreground hover:border-brand/15 hover:bg-card/65 hover:text-foreground'
                  }`}
                >
                  <span
                    className={`hidden size-9 shrink-0 items-center justify-center rounded-lg transition-colors motion-reduce:transition-none sm:flex ${
                      active ? 'bg-brand text-brand-foreground' : 'bg-card text-brand'
                    }`}
                  >
                    <ChoiceIcon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="sm:hidden">{solution.mobileChoice}</span>
                  <span className="hidden min-w-0 flex-1 sm:inline">{solution.choice}</span>
                  <ChevronRight
                    className={`hidden size-4 shrink-0 transition-transform motion-reduce:transition-none sm:block ${
                      active ? 'translate-x-0 text-brand' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-brand/10 bg-card p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
          <article
            key={selected.id}
            aria-live="polite"
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand sm:size-11 sm:rounded-xl">
                <SelectedIcon className="size-4 sm:size-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                Moje odporúčanie
              </p>
            </div>

            <h3 className="mt-4 text-pretty text-2xl font-bold tracking-tight sm:mt-6 sm:text-3xl">
              {selected.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              <span className="sm:hidden">{selected.mobileDescription}</span>
              <span className="hidden sm:inline">{selected.description}</span>
            </p>

            {selected.price ? (
              <div className="mt-4 flex flex-col border-y border-border py-4 sm:mt-7 sm:py-5">
                <p className="text-3xl font-bold tracking-tight text-foreground sm:mt-1.5 sm:text-4xl">
                  {selected.price}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:order-first">
                  Orientačná cena
                </p>
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-brand-soft/70 px-4 py-3 text-sm font-semibold text-foreground sm:mt-7 sm:py-4 sm:text-base">
                {selected.note}
              </p>
            )}

            {selected.items ? (
              <div className="mt-4 sm:mt-6">
                <p className="text-sm font-semibold text-foreground">Čo je zvyčajne v cene:</p>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:hidden">
                  {mobileItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 hidden gap-x-6 gap-y-3 text-sm text-muted-foreground sm:grid sm:grid-cols-2">
                  {selected.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {selected.timeframe ? (
              <p className="mt-4 text-sm text-muted-foreground sm:mt-6">
                <span className="font-semibold text-foreground sm:hidden">Realizácia:</span>
                <span className="hidden font-semibold text-foreground sm:inline">Čas realizácie:</span>{' '}
                <span className="sm:hidden">{selected.timeframe.replace('orientačne ', 'približne ')}</span>
                <span className="hidden sm:inline">{selected.timeframe}</span>
              </p>
            ) : null}

            {selected.price && selected.note ? (
              <p className="mt-6 hidden text-xs leading-relaxed text-muted-foreground sm:block">{selected.note}</p>
            ) : null}

            <ContactFormLink
              message={`Dobrý deň, chcem prebrať: ${selected.choice.toLocaleLowerCase('sk')}.`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:mt-7 sm:w-auto"
            >
              {selected.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </ContactFormLink>

            {selected.price && (detailItems.length > 0 || selected.note) ? (
              <details className="group mt-3 rounded-xl sm:hidden">
                <summary className="cursor-pointer list-none rounded-lg px-2 py-2 text-center text-xs font-semibold text-brand outline-none transition-colors hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand/25 motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">+ Zobraziť detaily</span>
                  <span className="hidden group-open:inline">− Skryť detaily</span>
                </summary>
                <div className="mt-2 rounded-xl bg-secondary/70 p-4 text-xs leading-relaxed text-muted-foreground">
                  {detailItems.length > 0 ? (
                    <ul className="grid gap-2">
                      {detailItems.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {selected.note ? <p className={detailItems.length > 0 ? 'mt-3' : ''}>{selected.note}</p> : null}
                </div>
              </details>
            ) : null}
          </article>
        </div>
      </div>

      <aside className="mt-5 rounded-2xl border border-brand/15 bg-card p-4 shadow-card lg:hidden">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Jasnejšie zadanie, nižšia cena</p>
        <p className="mt-2 whitespace-nowrap text-[11px] font-semibold text-foreground">
          Dohodneme cieľ <span className="text-brand">→</span> cenu <span className="text-brand">→</span>{' '}
          až potom začnem
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Čím viac si ujasníme na začiatku, tým menej času zaberú neskoršie zmeny.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Nemáte presnú predstavu? Nevadí.</span>{' '}
          Nájdeme riešenie spolu.
        </p>
      </aside>

      <div className="mt-12 border-t border-border pt-10 sm:mt-20 sm:pt-16 lg:mt-24 lg:pt-20">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-14">
          <div>
            <SectionLabel>
              <span className="sm:hidden">Jednorazová spolupráca</span>
              <span className="hidden sm:inline">Hodinová spolupráca</span>
            </SectionLabel>
            <h2 className="mt-3 text-pretty text-3xl font-bold tracking-tight sm:mt-4 sm:text-4xl">
              <span className="sm:hidden">Potrebujete len menšiu úpravu?</span>
              <span className="hidden sm:inline">Potrebujete menšiu alebo netypickú úpravu?</span>
            </h2>
            <p className="mt-4 hidden text-base leading-relaxed text-muted-foreground sm:block">
              Pri menších úpravách, programovaní či technickej pomoci účtujem len čas,
              ktorý na práci naozaj strávim.
            </p>
          </div>

          <div className="rounded-3xl bg-brand-soft/55 p-5 sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-foreground">Hodinová sadzba</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  60 € <span className="text-lg font-semibold text-muted-foreground sm:text-xl">/ hod.</span>
                </p>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-brand shadow-sm">
                <Clock3 className="size-5" aria-hidden="true" />
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-foreground sm:mt-5">
              Platíte len za čas, ktorý na práci skutočne strávim.
            </p>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:hidden">
              Pred začiatkom vám poviem, koľko času to približne zaberie a akú cenu môžete čakať.
            </p>

            <Link
              href="/rezervacia"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:hidden"
            >
              Prebrať úpravu
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <details className="group mt-3 sm:hidden">
              <summary className="cursor-pointer list-none rounded-lg px-2 py-2 text-center text-xs font-semibold text-brand outline-none transition-colors hover:bg-card/70 focus-visible:ring-2 focus-visible:ring-brand/25 motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">+ Zobraziť detaily</span>
                <span className="hidden group-open:inline">− Skryť detaily</span>
              </summary>
              <div className="mt-2 rounded-xl bg-card/75 p-4">
                <ol className="grid gap-2.5 text-xs text-muted-foreground">
                  <li><span className="font-bold text-brand">01</span> — Poviete mi, čo treba upraviť. Ja odhadnem čas a cenu.</li>
                  <li><span className="font-bold text-brand">02</span> — Ak vám odhad vyhovuje, začnem.</li>
                  <li><span className="font-bold text-brand">03</span> — Zaplatíte za čas, ktorý som skutočne odpracoval.</li>
                </ol>
                <p className="mt-3 text-xs font-semibold text-foreground">Jasné zadanie šetrí čas aj peniaze</p>
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Príklady hodinovej spolupráce">
                  {hourlyExamples.map((example) => (
                    <li key={example} className="rounded-full bg-brand-soft/70 px-2.5 py-1 text-[11px] text-muted-foreground">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </details>

            <ol className="mt-5 hidden gap-3 sm:grid sm:grid-cols-3">
              <li className="rounded-xl bg-card/80 p-3.5">
                <span className="text-xs font-bold text-brand">01</span>
                <p className="mt-1.5 text-sm font-semibold text-foreground">Poviete mi, čo treba</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Prejdeme si zadanie a poviem vám približný čas aj cenu.
                </p>
              </li>
              <li className="rounded-xl bg-card/80 p-3.5">
                <span className="text-xs font-bold text-brand">02</span>
                <p className="mt-1.5 text-sm font-semibold text-foreground">Dohodneme sa</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Keď vám rozsah aj odhad vyhovujú, začnem pracovať.
                </p>
              </li>
              <li className="rounded-xl bg-card/80 p-3.5">
                <span className="text-xs font-bold text-brand">03</span>
                <p className="mt-1.5 text-sm font-semibold text-foreground">Zaplatíte reálny čas</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Zaplatíte len za čas, ktorý som na práci naozaj strávil.
                </p>
              </li>
            </ol>

            <div className="mt-5 hidden items-start gap-3 rounded-xl border border-brand/15 bg-card p-4 sm:flex">
              <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-foreground">Jasné zadanie šetrí čas aj peniaze</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Čím viac si ujasníme na začiatku, tým menej času zaberú neskoršie zmeny
                  a tým ľahšie udržíme dohodnutý rozpočet.
                </p>
              </div>
            </div>

            <ul className="mt-5 hidden flex-wrap gap-2 sm:flex" aria-label="Príklady hodinovej spolupráce">
              {hourlyExamples.map((example) => (
                <li
                  key={example}
                  className="rounded-full border border-brand/10 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {example}
                </li>
              ))}
            </ul>

            <Link
              href="/rezervacia"
              className="mt-7 hidden w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:inline-flex sm:w-auto"
            >
              Rezervovať konzultáciu
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
