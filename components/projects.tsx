import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, CalendarDays, Bot } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { CalendarPreview, FlowPreview } from '@/components/project-previews'

type Project = {
  slug: string
  icon: typeof ShoppingBag
  iconClass: string
  category: string
  title: string
  problem: string
  result: string
  tags: string[]
  preview: React.ReactNode
}

export const projects: Project[] = [
  {
    slug: 'eshop-na-mieru',
    icon: ShoppingBag,
    iconClass: 'bg-brand-soft text-brand',
    category: 'E-shop riešenie',
    title: 'E-shop na mieru',
    problem: 'Prehľadný predajný web so skladom, produktmi a jednoduchým nákupným tokom.',
    result: 'Jednoduchšia správa produktov a objednávok.',
    tags: ['Pre e-shopy', 'Webová aplikácia'],
    preview: (
      <Image
        src="/product-backpack.png"
        alt="Ukážka produktu v e-shope"
        width={720}
        height={480}
        className="h-full w-full object-cover"
      />
    ),
  },
  {
    slug: 'rezervacny-system',
    icon: CalendarDays,
    iconClass: 'bg-brand-soft text-brand',
    category: 'Rezervačný systém',
    title: 'Rezervácie bez chaosu',
    problem: 'Online rezervácie a pripomienky namiesto manuálneho riešenia termínov.',
    result: 'Jasnejší prehľad termínov pre zákazníka aj prevádzku.',
    tags: ['Pre služby', 'Webová aplikácia'],
    preview: <CalendarPreview />,
  },
  {
    slug: 'automatizacia-faktur',
    icon: Bot,
    iconClass: 'bg-brand-soft text-brand',
    category: 'AI automatizácia',
    title: 'AI automatizácia faktúr',
    problem: 'Doklady, faktúry a administratíva, ktoré sa zbytočne opakujú ručne.',
    result: 'Automatizované spracovanie faktúr a menej manuálnej administratívy.',
    tags: ['AI', 'Automatizácia'],
    preview: <FlowPreview />,
  },
]

export function Projects() {
  return (
    <section id="projekty" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <SectionLabel>Moje projekty</SectionLabel>
          <h2 className="mt-4 max-w-3xl text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
            Vybrané projekty
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Weby, aplikácie a interné systémy, ktoré som navrhol a vytvoril.
          </p>
        </div>
        <Link
          href="/projekty"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          Zobraziť všetky projekty
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <li
            key={p.title}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="aspect-[16/10] overflow-hidden rounded-xl border border-border bg-secondary">
              {p.preview}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="inline-flex w-fit items-center rounded-md bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                {p.category}
              </span>
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${p.iconClass}`}>
                <p.icon className="size-4" aria-hidden="true" />
              </div>
            </div>

            <h3 className="mt-3 text-xl font-bold tracking-tight">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.problem}</p>

            <div className="mt-5 rounded-xl bg-secondary/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Výsledok
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                {p.result}
              </p>
            </div>

            <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-5">
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
              <Link
                href={`/projekty#${p.slug}`}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand/80"
              >
                Pozrieť projekt
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
