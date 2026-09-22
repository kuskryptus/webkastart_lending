import { ArrowRight, Check, Clock3 } from 'lucide-react'
import { ContactFormLink } from '@/components/contact-form-link'
import { SectionLabel } from '@/components/section-label'

const services = [
  'Úpravy a opravy existujúcich webov',
  'Nové weby a landing pages',
  'Webové aplikácie a nové funkcie',
  'AI, automatizácie a prepojenia systémov',
  'Optimalizácia rýchlosti a použiteľnosti',
  'Technická pomoc a konzultácie',
]

export function Pricing() {
  return (
    <section id="sluzby" className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <SectionLabel>Služby a cena</SectionLabel>
        <h2 className="font-display mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Jedna jasná sadzba za všetku odbornú prácu
        </h2>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Bez neprehľadných balíkov. Rozsah si vopred ujasníme a dostanete odhad času aj
          ceny, aby ste vedeli, s akým rozpočtom počítať.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-brand/15 bg-card shadow-card sm:mt-10">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="bg-brand-soft/55 p-6 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-display text-sm font-semibold tracking-tight text-foreground">Hodinová sadzba</p>
                <p className="font-display mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  40 € <span className="text-xl font-semibold text-muted-foreground sm:text-2xl">/ hod.</span>
                </p>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-brand shadow-sm">
                <Clock3 className="size-5" aria-hidden="true" />
              </div>
            </div>

            <p className="mt-6 text-base font-semibold leading-relaxed text-foreground">
              Platíte len za čas, ktorý na vašom projekte skutočne odpracujem.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              V sadzbe je zahrnutá analýza, návrh riešenia, realizácia aj testovanie.
            </p>

            <ContactFormLink
              message="Dobrý deň, mám záujem o spoluprácu za hodinovú sadzbu 40 €. Potrebujem vyriešiť: "
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:w-auto"
            >
              Nezáväzne prebrať zadanie
              <ArrowRight className="size-4" aria-hidden="true" />
            </ContactFormLink>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              S čím vám môžem pomôcť
            </h3>
            <ul className="mt-5 grid gap-x-8 gap-y-4 text-sm text-muted-foreground sm:grid-cols-2">
              {services.map((service) => (
                <li key={service} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <span>{service}</span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </div>
    </section>
  )
}
