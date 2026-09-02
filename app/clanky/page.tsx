import type { Metadata } from 'next'
import { ArticleFeature } from '@/components/article-feature'
import { SectionLabel } from '@/components/section-label'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { articles } from '@/lib/articles'
import { siteUrl } from '@/lib/site'

const title = 'Články — WebkaStart'
const description =
  'Krátke príbehy z reálneho podnikania o problémoch, ktoré sa dajú vyriešiť jednoduchšou technológiou.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${siteUrl}/clanky`,
  },
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
    url: `${siteUrl}/clanky`,
    title,
    description,
    images: [articles[0].coverImage],
  },
}

export default function ArticlesPage() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 lg:pb-28 lg:pt-14">
        <div className="max-w-3xl">
          <SectionLabel>Články</SectionLabel>
          <h1 className="mt-4 text-pretty text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Malé príbehy z reálnej práce
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Konkrétne situácie, v ktorých telefonáty, tabuľky a ručná administratíva
            zbytočne berú čas — a jednoduchšie spôsoby, ako ich vyriešiť.
          </p>
        </div>

        <div className="mt-12 lg:mt-16">
          {articles.map((article, index) => (
            <ArticleFeature
              key={article.slug}
              article={article}
              headingLevel="h2"
              priority={index === 0}
            />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

