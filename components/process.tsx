import { MessageSquare, PenLine, Code2, Rocket } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'

const steps = [
  {
    icon: MessageSquare,
    title: 'Povieme si o nápade',
    desc: 'Poviete mi, čo chcete vyriešiť. Spýtam sa a navrhnem ďalší krok.',
  },
  {
    icon: PenLine,
    title: 'Navrhnem riešenie',
    desc: 'Pripravím krátky plán a ukážem, ako bude riešenie fungovať.',
  },
  {
    icon: Code2,
    title: 'Vytvorím riešenie',
    desc: 'Web, automatizáciu alebo aplikáciu vytvorím podľa dohody.',
  },
  {
    icon: Rocket,
    title: 'Spustíme ho',
    desc: 'Po spustení sa postarám o potrebné úpravy a opravy.',
  },
]

export function Process() {
  return (
    <section id="proces" className="mx-auto max-w-6xl px-5 py-6 sm:px-6">
      <div className="rounded-3xl bg-brand-soft/50 px-5 py-7 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <SectionLabel>Ako prebieha spolupráca</SectionLabel>
        <h2 className="font-display mt-3 text-pretty text-[1.75rem] font-bold leading-tight tracking-tight sm:mt-4 sm:text-4xl">
          Najprv si ujasníme, čo má riešenie robiť
        </h2>

        <ol className="mt-6 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative grid grid-cols-[2.5rem_1fr] items-start gap-x-3 sm:block">
              <div className="flex size-10 items-center justify-center rounded-xl bg-card text-brand shadow-sm sm:size-11">
                <step.icon className="size-[1.125rem] sm:size-5" aria-hidden="true" />
              </div>
              {i < steps.length - 1 && (
                <span
                  className="absolute -bottom-4 left-5 top-11 border-l border-dashed border-brand/30 sm:hidden"
                  aria-hidden="true"
                />
              )}
              {i < steps.length - 1 && (
                <span
                  className="absolute left-14 top-5 hidden h-px w-[calc(100%-2.5rem)] border-t border-dashed border-brand/40 lg:block"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold tracking-tight sm:mt-4">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-2">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
