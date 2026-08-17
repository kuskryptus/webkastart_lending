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
            WEBY • AUTOMATIZÁCIE • RIEŠENIA NA MIERU
          </span>

          <h1 className="mt-6 text-pretty text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Menej rutiny. <span className="text-brand">Viac priestoru</span> na podnikanie.
          </h1>

          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            Pomáham firmám zjednodušiť podnikanie pomocou webov, automatizácií, AI a riešení na mieru.
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
              className="relative order-first inline-flex items-center justify-center gap-2 overflow-visible rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:order-none"
            >
              Mám nápad
              <Lightbulb className="size-4" aria-hidden="true" />
              <span className="hero-tap-indicator pointer-events-none absolute right-5 top-1/2 lg:hidden" aria-hidden="true" />
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
        <div className="hero-visual-stage relative hidden lg:block">
          <div className="rounded-[14px] border border-border bg-primary p-2 shadow-card-hover">
            <div className="aspect-[16/11] w-full overflow-hidden rounded-lg bg-card">
              <DashboardMockup />
            </div>
          </div>
          <div className="mx-auto h-2.5 w-[calc(100%+2rem)] -translate-x-4 rounded-b-xl bg-primary/85" />
          <div className="hero-cursor-demo pointer-events-none absolute left-0 top-0 z-10 text-brand" aria-hidden="true">
            <svg
              className="hero-cursor-icon"
              width="26"
              height="31"
              viewBox="0 0 26 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 3.8L20.7 19.2L13.2 20.1L10.1 27.2L4.5 3.8Z"
                fill="var(--card)"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12.9 19.9L17.7 27.7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="hero-cursor-click" />
          </div>
        </div>
      </div>
    </section>
  )
}
