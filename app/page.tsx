import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Projects } from '@/components/projects'
import { Process } from '@/components/process'
import { About } from '@/components/about'
import { Pricing } from '@/components/pricing'
import { ArticlesSection } from '@/components/articles-section'
import { ContactBanner } from '@/components/contact-banner'
import { SiteFooter } from '@/components/site-footer'
import { HomeScrollReset } from '@/components/home-scroll-reset'
import { siteDescription, siteImageUrl, siteName, siteUrl } from '@/lib/site'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  url: siteUrl,
  name: siteName,
  description: siteDescription,
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: siteImageUrl,
  },
}

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <HomeScrollReset />
      <SiteHeader />
      <Hero />
      <Projects />
      <Process />
      <About />
      <Pricing />
      <ArticlesSection />
      <ContactBanner />
      <SiteFooter />
    </main>
  )
}
