import Link from 'next/link'
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
    intro: 'Ideálne ak potrebujete:',
    items: [
      'jednoduchú landing page',
      'jednostránkový web',
      'kontaktný formulár',
      'MVP nápad',
    ],
    highlight: 'Často hotové ešte dnes.',
  },
  {
    icon: Zap,
    name: 'Mini',
    price: '150–250 €',
    intro: 'Ideálne ak potrebujete:',
    items: [
      'firemný web',
      'rezervačný formulár',
      'jednoduchú aplikáciu',
      'administráciu',
      'prepojenie formulárov',
    ],
    highlight: 'Dodanie dnes alebo do 3 dní.',
  },
  {
    icon: Gem,
    name: 'Na mieru',
    price: '500 €+',
    intro: 'Ak potrebujete:',
    items: [
      'interný systém',
      'CRM',
      'fakturáciu',
      'klientsku zónu',
      'automatizácie',
    ],
    highlight: 'Funkčný základ do týždňa.',
  },
]

export function Pricing() {
  return (
    <section id="cennik" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="max-w-2xl">
        <SectionLabel>Cenník</SectionLabel>
        <h2 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Vyberte, čo potrebujete
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Vyberte si riešenie podľa rozsahu projektu. Ak si nie ste istí, pomôžem vám vybrať.
        </p>
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <li
            key={p.name}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <p.icon className="size-5" aria-hidden="true" />
              </div>
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
              {p.highlight && (
                <p className="flex min-h-12 items-center rounded-full border border-brand/15 bg-brand-soft/60 px-4 py-2 text-sm font-normal leading-snug text-brand shadow-sm">
                  {p.highlight}
                </p>
              )}

              <Link
                href="#kontakt"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Toto potrebujem
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
