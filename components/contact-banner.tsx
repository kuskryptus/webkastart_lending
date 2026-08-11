import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'

export function ContactBanner() {
  return (
    <section id="kontakt" className="mx-auto max-w-6xl px-5 py-6 sm:px-6 lg:pb-16">
      <div className="rounded-3xl bg-brand-soft/60 px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-pretty text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              Máš nápad alebo problém, ktorý by sa dal vyriešiť aplikáciou?
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Ozvi sa mi a pozrieme sa na to spolu. Bez záväzkov.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <a
              href="mailto:hello@webkastart.dev"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Mail className="size-4 text-brand" aria-hidden="true" />
              hello@webkastart.dev
            </a>
            <Link
              href="mailto:hello@webkastart.dev"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Napíš mi správu
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
