import type { Metadata } from 'next'
import { BookingCalendar } from '@/components/booking-calendar'
import { SectionLabel } from '@/components/section-label'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { siteName, siteUrl } from '@/lib/site'

const bookingUrl = `${siteUrl}/rezervacia`
const title = 'Rezervácia konzultácie | WebkaStart'
const description = 'Vyberte si voľný termín na úvodnú online konzultáciu o webe, aplikácii alebo automatizácii.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: bookingUrl },
  openGraph: {
    description,
    locale: 'sk_SK',
    siteName,
    title,
    type: 'website',
    url: bookingUrl,
  },
}

export default function BookingPage() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:pb-24 lg:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Rezervácia</SectionLabel>
          <h1 className="mt-4 text-pretty text-4xl font-bold tracking-tight sm:text-5xl">
            Dohodnime si krátku konzultáciu
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Vyberte si čas, ktorý vám vyhovuje. Bez zdĺhavého dohadovania cez email.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <BookingCalendar />
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
