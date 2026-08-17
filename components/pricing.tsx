'use client'

import { ArrowRight, Rocket, Zap, Gem, Check } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'

type Package = {
  icon: typeof Rocket
  name: string
  price: string
  intro: string
  items: string[]
  highlight?: string
}

const packages: Package[] = [
  {
    icon: Rocket,
    name: 'Štart',
    price: '100 €',
    intro: 'Vhodné, ak potrebujete:',
    items: [
      'jednoduchú prezentačnú stránku',
      'jednostránkový web',
      'kontaktný formulár',
      'overiť menší nápad',
    ],
    highlight: 'Menší rozsah',
  },
  {
    icon: Zap,
    name: 'Mini',
    price: '150–250 €',
    intro: 'Vhodné, ak potrebujete:',
    items: [
      'firemný web',
      'rezervačný formulár',
      'jednoduchú aplikáciu',
      'administráciu',
      'prepojenie formulárov',
    ],
    highlight: 'Krátke dodanie',
  },
  {
    icon: Gem,
    name: 'Na mieru',
    price: '500 €+',
    intro: 'Pre väčší rozsah:',
    items: [
      'interný systém',
      'CRM',
      'fakturáciu',
      'klientsku zónu',
      'automatizácie',
    ],
    highlight: 'Podľa dohody',
  },
]

export function Pricing() {
  function handlePlanClick(plan: Package) {
    const message = [
      `Mám záujem o balík ${plan.name} (${plan.price}).`,
      '',
      'Potrebujem vyriešiť:',
      ...plan.items.map((item) => `- ${item}`),
      '',
      'Môj projekt / poznámka:',
    ].join('\n')

    window.history.pushState(null, '', '#kontakt-formular')
    window.dispatchEvent(
      new CustomEvent('open-contact-form', {
        detail: {
          message,
        },
      }),
    )
  }

  return (
    <section id="cennik" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="max-w-2xl">
        <SectionLabel>Cenník</SectionLabel>
        <h2 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Orientačné ceny podľa rozsahu
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Po krátkom opise práce vám poviem presnejšiu cenu aj termín.
        </p>
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <li
            key={p.name}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="flex h-7 items-center justify-between gap-4">
              <p.icon className="size-7 shrink-0 text-brand" aria-hidden="true" />
              {p.highlight && (
                <p className="shrink-0 whitespace-nowrap text-right text-[10px] font-semibold uppercase leading-none tracking-wide text-brand">
                  {p.highlight}
                </p>
              )}
            </div>

            <h3 className="mt-5 text-xl font-bold tracking-tight">{p.name}</h3>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{p.price}</p>

            <p className="mt-5 text-sm font-medium text-muted-foreground">{p.intro}</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {p.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => handlePlanClick(p)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Chcem sa poradiť
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
