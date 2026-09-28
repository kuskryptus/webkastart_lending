import Image from 'next/image'
import { ArrowRight, Bot, Code2, Lightbulb, Ruler, Sparkles, Zap } from 'lucide-react'
import { HeroPaperReveal } from '@/components/hero-paper-reveal'
import { SectionLink } from '@/components/section-link'

const features = [
  { icon: Zap, title: 'Rýchle dodanie', desc: 'Pri menších weboch a úpravách.' },
  { icon: Ruler, title: 'Stačí popísať problém', desc: 'Navrhnem najbližší rozumný krok.' },
]

export function Hero() {
  return (
    <section className="relative isolate mx-auto max-w-[100rem] overflow-hidden px-5 pb-40 pt-4 sm:px-6 sm:pb-44 sm:pt-6 lg:pb-36 lg:pt-10">
      <HeroPaperReveal />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-x-12 gap-y-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-y-0">
        {/* Left */}
        <div className="max-w-xl lg:col-start-1 lg:row-start-1">
          <span className="font-display inline-flex max-w-full items-center gap-x-4 text-[11px] font-semibold uppercase leading-none tracking-wide text-brand sm:gap-x-5 sm:text-xs">
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

          <h1 className="font-display mt-5 text-balance text-[2.6rem] font-bold leading-[1.04] tracking-tight text-foreground sm:mt-6 sm:text-6xl">
            <span className="block">Weby a systémy</span>
            <span className="block">
              pre vaše <span className="text-brand">podnikanie.</span>
            </span>
          </h1>

          <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6">
            Weby a systémy, ktoré pomáhajú získavať zákazníkov a automatizujú opakovanú prácu.
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
        <figure className="relative mx-auto flex w-[90vw] max-w-[840px] flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:w-full lg:-translate-y-20 xl:w-[112%] 2xl:-translate-x-16">
          <figcaption className="pointer-events-none absolute left-full top-[6.7rem] z-10 ml-3 hidden w-[10.5rem] 2xl:block">
            <span className="block border-l border-brand/60 pl-3">
              <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                [ 01 · AI PLATFORM ]
              </span>
              <span className="mt-1.5 flex items-center gap-2 text-[13px] font-medium tracking-[-0.01em] text-foreground/80">
                <span className="size-1 bg-brand" aria-hidden="true" />
                Správa sociálnych sietí
              </span>
            </span>
          </figcaption>

          <Image
            src="/postly-laptop-stone-mefi-v2.png"
            alt="Aplikácia na správu sociálnych sietí zobrazená na notebooku"
            width={1442}
            height={960}
            priority
            sizes="(max-width: 1023px) 90vw, (min-width: 1280px) 700px, 52vw"
            className="order-1 h-auto w-full object-contain lg:mx-auto lg:mt-20 lg:w-[96%] lg:-translate-y-3"
          />
        </figure>

        <div className="lg:col-start-1 lg:row-start-2 lg:mt-10">
          <dl className="flex flex-wrap gap-x-10 gap-y-5 sm:gap-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-2.5">
                <f.icon className="mt-0.5 size-4 text-brand" aria-hidden="true" />
                <div>
                  <dt className="font-display text-sm font-semibold tracking-tight">{f.title}</dt>
                  <dd className="text-sm text-muted-foreground">{f.desc}</dd>
                </div>
              </div>
            ))}
          </dl>

        </div>
      </div>
    </section>
  )
}
