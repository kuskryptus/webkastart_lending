import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SectionLabel } from '@/components/section-label'
import { ProjectFeatureShowcase, projects } from '@/components/projects'
import { siteImageUrl, siteName, siteUrl } from '@/lib/site'

const projectsUrl = `${siteUrl}/projekty`
const title = 'Ukážky webov, aplikácií a automatizácií | WebkaStart'
const description =
  'Pozrite si realizované webové stránky, mobilné aplikácie, interné systémy a automatizácie od WebkaStart.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: projectsUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
    url: projectsUrl,
    siteName,
    title,
    description,
    images: [siteImageUrl],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteImageUrl],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  url: projectsUrl,
  name: title,
  description,
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: project.title,
      description: project.summary,
      url: `${projectsUrl}#${project.slug}`,
    })),
  },
}

export default function ProjectsPage() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:pb-24 lg:pt-14">
        <div className="max-w-3xl">
          <SectionLabel>Produktové ukážky</SectionLabel>
          <h1 className="mt-4 text-pretty text-4xl font-bold tracking-tight sm:text-5xl">
            Realizované weby, aplikácie a automatizácie
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Pozrite si konkrétne projekty a stručný popis problémov, ktoré riešia.
          </p>
        </div>

        <div className="mt-12">
          {projects.map((project, index) => (
            <ProjectFeatureShowcase
              key={project.slug}
              priority={index === 0}
              project={project}
              reversed={index % 2 === 1}
            />
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/#kontakt"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Chcem podobný projekt
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
