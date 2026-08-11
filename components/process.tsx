import { MessageSquare, PenLine, Code2, Rocket } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'

const steps = [
  {
    icon: MessageSquare,
    title: 'Povieme si o nápade',
    desc: 'Povieš mi, čo potrebuješ vyriešiť. Ja sa pýtam, počúvam a navrhnem smer.',
  },
  {
    icon: PenLine,
    title: 'Navrhnem riešenie',
    desc: 'Pripravím jednoduchý plán a ukážem, ako to bude fungovať.',
  },
  {
    icon: Code2,
    title: 'Vytvorím aplikáciu',
    desc: 'Napíšem čistý, udržiavateľný kód a postavím spoľahlivú aplikáciu.',
  },
  {
    icon: Rocket,
    title: 'Spustíme a zlepšujeme',
    desc: 'Aplikácia beží, ja som tu na podporu a ďalší rozvoj, keď to budeš potrebovať.',
  },
]

export function Process() {
  return (
    <section id="proces" className="mx-auto max-w-6xl px-5 py-6 sm:px-6">
      <div className="rounded-3xl bg-brand-soft/50 px-6 py-12 sm:px-10 lg:px-12 lg:py-14">
        <SectionLabel>Ako prebieha spolupráca</SectionLabel>
        <h2 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Jednoduchý proces, ktorý funguje
        </h2>

        <ol className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="flex size-11 items-center justify-center rounded-xl bg-card text-brand shadow-sm">
                <step.icon className="size-5" aria-hidden="true" />
              </div>
              {i < steps.length - 1 && (
                <span
                  className="absolute left-14 top-5 hidden h-px w-[calc(100%-2.5rem)] border-t border-dashed border-brand/40 lg:block"
                  aria-hidden="true"
                />
              )}
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
