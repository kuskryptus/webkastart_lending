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
import { siteDescription, siteImageUrl, siteName, siteTitle, siteUrl } from '@/lib/site'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      legalName: 'Kristián Kampczyk',
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      image: siteImageUrl,
      description: siteDescription,
      email: 'kampczykristian@gmail.com',
      telephone: '+421950591354',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nitrianska 2439/6',
        postalCode: '052 01',
        addressLocality: 'Spišská Nová Ves',
        addressCountry: 'SK',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Slovensko',
      },
      identifier: {
        '@type': 'PropertyValue',
        name: 'IČO',
        value: '57723940',
      },
      sameAs: [
        'https://www.instagram.com/kristiankampczyk/',
        'https://www.facebook.com/kristian.kampczyk.3',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      inLanguage: 'sk',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: siteTitle,
      description: siteDescription,
      inLanguage: 'sk',
      isPartOf: {
        '@id': `${siteUrl}/#website`,
      },
      about: {
        '@id': `${siteUrl}/#organization`,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: siteImageUrl,
      },
    },
  ],
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
