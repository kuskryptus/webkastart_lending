import Link from 'next/link'
import { ArrowRight, Lightbulb, Zap, Sparkles, Ruler } from 'lucide-react'
import { DashboardMockup } from '@/components/dashboard-mockup'

const features = [
  { icon: Zap, title: 'Hotové ešte dnes', desc: 'Pri jednoduchších projektoch.' },
  { icon: Sparkles, title: 'Od 100 €', desc: 'Transparentná cena bez prekvapení.' },
  { icon: Ruler, title: 'Stačí problém', desc: 'Riešenie nájdeme a prekonzultujeme.' },
]

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-10 pt-6 sm:px-6 lg:pb-20 lg:pt-10">
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        {/* Left */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            OD NÁPADU K RIEŠENIU
          </span>

          <h1 className="mt-6 text-pretty text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Máte nápad?{' '}
            <span className="text-foreground">
              Postarám sa o <span className="text-brand">zvyšok</span>..
            </span>
          </h1>

          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            Máte nápad, ktorý chcete overiť? Potrebujete web, interný systém alebo jednoduchú aplikáciu? Navrhnem a vytvorím riešenie bez zbytočne dlhého vývoja a veľkých rozpočtov.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="#projekty"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:order-none"
            >
              Pozrieť projekty
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="#kontakt"
              className="order-first inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:order-none"
            >
              Mám nápad
              <Lightbulb className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-2.5">
                <f.icon className="mt-0.5 size-4 text-brand" aria-hidden="true" />
                <div>
                  <dt className="text-sm font-semibold">{f.title}</dt>
                  <dd className="text-sm text-muted-foreground">{f.desc}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Right */}
        <div className="relative hidden lg:block">
          <div className="rounded-[14px] border border-border bg-primary p-2 shadow-card-hover">
            <div className="aspect-[16/11] w-full overflow-hidden rounded-lg bg-card">
              <DashboardMockup />
            </div>
          </div>
          <div className="mx-auto h-2.5 w-[calc(100%+2rem)] -translate-x-4 rounded-b-xl bg-primary/85" />

          <figure className="absolute -bottom-6 right-2 max-w-[220px] rounded-xl border border-border bg-card p-4 shadow-card-hover sm:right-6">
            <span className="text-2xl font-serif leading-none text-brand" aria-hidden="true">
              &#8220;
            </span>
            <blockquote className="mt-1 text-sm leading-snug text-foreground">
              Vďaka tejto aplikácii máme vo fakturácii konečne poriadok.
            </blockquote>
            <figcaption className="mt-2 text-xs text-muted-foreground">
              — Petra, účtovníctvo
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
