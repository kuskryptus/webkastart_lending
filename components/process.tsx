import { ArrowRight } from 'lucide-react'
import { ContactFormLink } from '@/components/contact-form-link'
import { SectionLabel } from '@/components/section-label'

const steps = [
  {
    number: '01',
    title: 'Vyplníte formulár podľa projektu',
    description:
      'Zobrazia sa vám len otázky, ktoré potrebujem na pochopenie vášho podnikania, zákazníkov, cieľa a podkladov.',
    emphasis: 'Vyplníte ho vlastným tempom a odpovede sa priebežne ukladajú.',
  },
  {
    number: '02',
    title: 'Dostanete zhrnutie a návrh riešenia',
    description:
      'Vaše odpovede premením na prehľadnú rekapituláciu cieľa, potrieb a odporúčaného riešenia. Spoločne ju prejdeme a doplníme, čo chýba.',
    emphasis: 'Najprv si potvrdíme, že riešime správny problém.',
  },
  {
    number: '03',
    title: 'Dohodneme rozsah a cenu',
    description:
      'Keď je cieľ aj riešenie jasné, stanovím potrebné kroky a odhad práce. Odsúhlasíme rozsah, cenu a ďalší postup.',
    emphasis: 'Vopred viete, čo sa bude robiť a s akým rozpočtom počítať.',
  },
  {
    number: '04',
    title: 'Pustím sa do realizácie',
    description:
      'Schválené riešenie navrhnem, vytvorím a otestujem. Výsledok spolu skontrolujeme, doladíme a pripravíme na spustenie.',
    emphasis: 'Jasné zadanie od začiatku znamená menej nejasností a zbytočných úprav.',
  },
]

export function Process() {
  return (
    <section id="proces" className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-16 lg:py-24">
      <div className="overflow-hidden rounded-3xl bg-brand-soft/55 px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div className="lg:pt-1">
            <SectionLabel>Ako prebieha spolupráca</SectionLabel>
            <h2 className="font-display mt-4 max-w-xl text-pretty text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Najprv si ujasníme cieľ. Potom sa pustím do práce.
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              Jednoduchý formulár, jasná rekapitulácia a dohodnutý postup. Od začiatku viete,
              čo odo mňa dostanete a čo bude nasledovať.
            </p>

            <ContactFormLink
              message="Dobrý deň, mám záujem prebrať svoj projekt a ďalší postup. Potrebujem vyriešiť: "
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:w-auto"
            >
              Chcem prebrať svoj projekt
              <ArrowRight className="size-4" aria-hidden="true" />
            </ContactFormLink>
          </div>

          <ol>
            {steps.map((step) => (
              <li
                key={step.number}
                className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-brand/15 py-6 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[3rem_1fr] sm:gap-5 sm:py-7"
              >
                <span className="font-display pt-0.5 text-sm font-semibold tracking-wide text-brand">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold leading-snug tracking-tight sm:text-xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {step.description}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
                    {step.emphasis}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
