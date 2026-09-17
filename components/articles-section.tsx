import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ArticleFeature } from '@/components/article-feature'
import { SectionLabel } from '@/components/section-label'
import { articles } from '@/lib/articles'

export function ArticlesSection() {
  const featuredArticle = articles[0]

  return (
    <section id="clanky" className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-4xl">
          <SectionLabel>Články</SectionLabel>
          <h2 className="font-display mt-3 text-pretty text-[clamp(2.125rem,5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.04em]">
            Problémy z praxe. Jednoduchšie riešenia.
          </h2>
        </div>

        {articles.length > 1 && (
          <Link
            href="/clanky"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Všetky články
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="mt-8 lg:mt-9">
        <ArticleFeature article={featuredArticle} compact />
      </div>
    </section>
  )
}
