import { MessageSquare, PenLine, Code2, Rocket } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'

const steps = [
  {
    icon: MessageSquare,
    title: 'Povieme si o nápade',
    desc: 'Poviete mi, čo potrebujete vyriešiť. Spýtam sa na dôležité veci a navrhnem smer.',
  },
  {
    icon: PenLine,
    title: 'Navrhnem riešenie',
    desc: 'Pripravím krátky plán a ukážem, ako bude riešenie fungovať.',
  },
  {
    icon: Code2,
    title: 'Vytvorím riešenie',
    desc: 'Postavím web, automatizáciu alebo aplikáciu podľa dohodnutého rozsahu.',
  },
  {
    icon: Rocket,
    title: 'Spustíme ho',
    desc: 'Po spustení riešim úpravy, opravy a ďalší rozvoj podľa potreby.',
  },
]

export function Process() {
  return (
    <section id="proces" className="mx-auto max-w-6xl px-5 py-6 sm:px-6">
      <div className="rounded-3xl bg-brand-soft/50 px-6 py-12 sm:px-10 lg:px-12 lg:py-14">
        <SectionLabel>Ako prebieha spolupráca</SectionLabel>
        <h2 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Najprv si ujasníme, čo má riešenie robiť
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
