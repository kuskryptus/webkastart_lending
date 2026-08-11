import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, CalendarDays, Bot } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { CalendarPreview, FlowPreview } from '@/components/project-previews'

type Project = {
  icon: typeof ShoppingBag
  iconClass: string
  category: string
  title: string
  desc: string
  metric: string
  metricLabel: string
  tags: string[]
  preview: React.ReactNode
}

const projects: Project[] = [
  {
    icon: ShoppingBag,
    iconClass: 'bg-emerald-50 text-emerald-600',
    category: 'E-shop riešenie',
    title: 'E-shop na mieru',
    desc: 'Rýchly e-shop so skladom a automatickými odosielaniami.',
    metric: '+32 %',
    metricLabel: 'nárast objednávok po spustení',
    tags: ['Pre e-shopy', 'Webová aplikácia'],
    preview: (
      <Image
        src="/product-backpack.png"
        alt="Ukážka produktu v e-shope"
        width={240}
        height={160}
        className="h-full w-full rounded-lg object-cover"
      />
    ),
  },
  {
    icon: CalendarDays,
    iconClass: 'bg-brand-soft text-brand',
    category: 'Rezervačný systém',
    title: 'Rezervácie bez chaosu',
    desc: 'Online rezervácie a pripomienky, ktoré šetria čas tebe aj zákazníkom.',
    metric: '-70 %',
    metricLabel: 'menej telefonátov a e-mailov',
    tags: ['Pre služby', 'Webová aplikácia'],
    preview: <CalendarPreview />,
  },
  {
    icon: Bot,
    iconClass: 'bg-amber-50 text-amber-600',
    category: 'AI automatizácia',
    title: 'AI automatizácia faktúr',
    desc: 'Automatické spracovanie dokladov a odosielanie faktúr.',
    metric: '10+ h',
    metricLabel: 'ušetrených každý týždeň',
    tags: ['Pre firmy', 'Automatizácia'],
    preview: <FlowPreview />,
  },
]

export function Projects() {
  return (
    <section id="projekty" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionLabel>Moje projekty</SectionLabel>
          <h2 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
            Riešenia, ktoré prinášajú výsledky
          </h2>
        </div>
        <Link
          href="#kontakt"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand/80"
        >
          Zobraziť všetky projekty
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <li
            key={p.title}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-foreground/5"
          >
            <div className={`flex size-11 items-center justify-center rounded-xl ${p.iconClass}`}>
              <p.icon className="size-5" aria-hidden="true" />
            </div>

            <span className="mt-5 inline-block w-fit rounded-md bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {p.category}
            </span>

            <h3 className="mt-3 text-xl font-bold tracking-tight">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>

            <div className="mt-5 grid grid-cols-2 items-stretch gap-3 rounded-xl bg-secondary/60 p-3">
              <div className="flex flex-col justify-center px-1">
                <p className="text-xs font-medium text-muted-foreground">Výsledok</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{p.metric}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {p.metricLabel}
                </p>
              </div>
              <div className="aspect-[3/2] overflow-hidden rounded-lg bg-card">
                {p.preview}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <div className="flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                aria-hidden="true"
              >
                <ArrowRight className="size-4" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
