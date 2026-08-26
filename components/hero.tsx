import Image from 'next/image'
import { ArrowRight, Bot, Code2, Lightbulb, Ruler, Sparkles, Zap } from 'lucide-react'
import { SectionLink } from '@/components/section-link'

const features = [
  { icon: Zap, title: 'Rýchle dodanie', desc: 'Pri menších weboch a úpravách.' },
  { icon: Sparkles, title: 'Od 100 €', desc: 'Rozsah a cenu poviem vopred.' },
  { icon: Ruler, title: 'Stačí popísať problém', desc: 'Navrhnem najbližší rozumný krok.' },
]

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:pb-20 lg:pt-10">
      <div className="grid items-center gap-x-12 gap-y-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-y-0">
        {/* Left */}
        <div className="max-w-xl lg:col-start-1 lg:row-start-1">
          <span className="inline-flex max-w-full items-center gap-x-4 text-[11px] font-semibold uppercase leading-none tracking-wide text-brand sm:gap-x-5 sm:text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Code2 className="size-3.5" aria-hidden="true" />
              Weby
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bot className="size-3.5" aria-hidden="true" />
              Automatizácie
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Riešenia na mieru
            </span>
          </span>

          <h1 className="mt-5 text-balance text-[2.6rem] font-bold leading-[1.04] tracking-tight text-foreground sm:mt-6 sm:text-6xl">
            Menej rutiny.
            <br />
            <span className="text-brand">Viac času</span> <span className="whitespace-nowrap">na podnikanie.</span>
          </h1>

          <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6">
            Zjednodušujem firmám prácu pomocou webov, automatizácií a riešení na mieru.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <SectionLink
              href="#kontakt"
              className="relative inline-flex items-center justify-center gap-2 overflow-visible rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Nezáväzne sa poradiť
              <Lightbulb className="size-4" aria-hidden="true" />
              <span className="hero-tap-indicator pointer-events-none absolute right-5 top-1/2 lg:hidden" aria-hidden="true" />
            </SectionLink>
            <SectionLink
              href="#projekty"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Pozrieť projekty
              <ArrowRight className="size-4" aria-hidden="true" />
            </SectionLink>
          </div>

        </div>

        {/* Right */}
        <figure className="relative mx-auto w-[90vw] max-w-[840px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-full lg:translate-y-6 xl:w-[112%] xl:-translate-x-4">
          <figcaption className="pointer-events-none absolute -top-14 right-[2%] z-10 hidden items-start gap-4 lg:flex xl:-top-12 xl:right-0">
            <svg
              className="mt-5 h-16 w-24 overflow-visible text-brand/80"
              viewBox="0 0 96 64"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M93 5C65 6 50 18 46 37C44 47 38 53 25 55"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M32 48L24 55L33 59"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                Ukážkový projekt
              </p>
              <p className="mt-1 max-w-44 text-sm font-semibold leading-snug text-foreground">
                Správa sociálnych sietí
              </p>
            </div>
          </figcaption>

          <Image
            src="/postly-laptop-stone-socia.png"
            alt="Aplikácia na správu sociálnych sietí zobrazená na notebooku"
            width={1442}
            height={960}
            priority
            sizes="(max-width: 1023px) 90vw, (min-width: 1280px) 700px, 52vw"
            className="h-auto w-full object-contain drop-shadow-[0_20px_24px_rgb(24_23_22_/_13%)]"
          />
        </figure>

        <dl className="flex flex-wrap gap-x-10 gap-y-5 sm:gap-y-6 lg:col-start-1 lg:row-start-2 lg:mt-10">
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
    </section>
  )
}
