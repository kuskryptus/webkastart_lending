import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Projects } from '@/components/projects'
import { Process } from '@/components/process'
import { About } from '@/components/about'
import { Pricing } from '@/components/pricing'
import { ContactBanner } from '@/components/contact-banner'
import { SiteFooter } from '@/components/site-footer'
import { HomeScrollReset } from '@/components/home-scroll-reset'

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background">
      <HomeScrollReset />
      <SiteHeader />
      <Hero />
      <Projects />
      <Process />
      <About />
      <Pricing />
      <ContactBanner />
      <SiteFooter />
    </main>
  )
}
