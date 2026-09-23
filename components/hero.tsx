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
        <figure className="relative mx-auto flex w-[90vw] max-w-[840px] flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:w-full lg:translate-y-6 xl:w-[112%] xl:-translate-x-4">
          <figcaption className="pointer-events-none absolute right-[2%] top-1 z-10 hidden -rotate-2 items-end gap-2 text-muted-foreground/80 xl:flex">
            <svg
              className="mb-0.5 h-16 w-20 shrink-0 overflow-visible text-brand/65"
              viewBox="0 0 80 64"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M76 7C53 10 52 27 45 40C38 52 28 57 10 57"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M19 50L9 57L20 62"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-display w-44 text-sm italic leading-snug">
              AI platforma
              <br />
              na správu
              <br />
              sociálnych sietí.
            </span>
          </figcaption>

          <Image
            src="/postly-laptop-stone-mefi-v2.png"
            alt="Aplikácia na správu sociálnych sietí zobrazená na notebooku"
            width={1442}
            height={960}
            priority
            sizes="(max-width: 1023px) 90vw, (min-width: 1280px) 700px, 52vw"
            className="order-1 h-auto w-full object-contain drop-shadow-[0_20px_24px_rgb(24_23_22_/_13%)] lg:mt-20"
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

          <div
            aria-hidden="true"
            className="mt-6 ml-2 hidden -translate-y-6 -rotate-4 items-end gap-3 text-muted-foreground/75 xl:flex"
          >
            <span className="font-display text-sm italic leading-snug">
              Staré spôsoby
              <br />
              nechaj za sebou.
            </span>
            <svg className="h-10 w-24 text-brand/65" viewBox="0 0 96 40" fill="none">
              <path d="M2 31C28 31 54 24 86 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M76 7L88 9L81 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
