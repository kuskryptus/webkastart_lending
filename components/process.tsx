import { ArrowRight } from 'lucide-react'
import { ContactFormLink } from '@/components/contact-form-link'
import { SectionLabel } from '@/components/section-label'

const steps = [
  {
    number: '01',
    title: 'Pochopíme, čo potrebujete',
    description:
      'Krátko si prejdeme váš cieľ, zákazníkov a to, čo má nový web, e-shop alebo rozhranie priniesť.',
    emphasis: 'Bez zdĺhavých workshopov. Len to podstatné.',
  },
  {
    number: '02',
    title: 'Ukážem vám smer',
    description:
      'Pripravím ukážku kľúčovej časti riešenia — napríklad úvodnú sekciu webu, časť e-shopu alebo hlavnú obrazovku aplikácie.',
    emphasis:
      'Nejde o celý projekt zadarmo, ale o ukážku, na ktorej uvidíte môj prístup, vizuálny smer a potenciál výsledku.',
    quote: '„Áno, presne takto som si to predstavoval.“',
  },
  {
    number: '03',
    title: 'Až potom sa rozhodnete',
    description:
      'Ak vám navrhnutý smer dáva zmysel, odsúhlasíme rozsah, cenu a pustíme sa do kompletnej realizácie.',
    emphasis: 'Viete, do čoho idete ešte predtým, než sa zaviažete k celému projektu.',
  },
  {
    number: '04',
    title: 'Dotiahneme to do výsledku',
    description:
      'Schválený smer rozpracujem do kompletného riešenia, doladím detaily a pripravím všetko na spustenie.',
    emphasis: 'Menej neistoty. Menej zbytočných revízií. Jasný smer od začiatku.',
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
              Najprv uvidíte smer. Potom sa rozhodnete.
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              Nemusíte schváliť projekt len na základe predstavy. Najskôr vám ukážem, ako by
              mohlo vaše riešenie vyzerať a fungovať.
            </p>

            <ContactFormLink
              message="Dobrý deň, mám záujem vidieť prvý návrh pre môj projekt. Potrebujem vyriešiť: "
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:w-auto"
            >
              Chcem vidieť prvý návrh
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
                  {step.quote ? (
                    <p className="mt-3 border-l-2 border-brand/35 pl-3 text-sm italic leading-relaxed text-brand">
                      {step.quote}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
