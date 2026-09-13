import { ArrowRight, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { SectionLabel } from '@/components/section-label'

export function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <SectionLabel>Spolupráca</SectionLabel>
        <h2 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Jednoduchá hodinová sadzba
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Pred začiatkom si prejdeme zadanie a poviem vám odhad rozsahu aj ceny.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <Clock3 className="size-7 text-brand" aria-hidden="true" />
        <h3 className="mt-5 text-xl font-bold tracking-tight">Moja hodinová sadzba</h3>
        <p className="mt-3 text-4xl font-bold tracking-tight text-foreground">
          60 €<span className="text-xl text-muted-foreground">/hod.</span>
        </p>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Platíte za skutočne odpracovaný čas. O priebehu práce aj nákladoch budete mať prehľad.
        </p>

        <Link
          href="/rezervacia"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Rezervovať konzultáciu
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
