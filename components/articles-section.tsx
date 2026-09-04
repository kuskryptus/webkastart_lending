import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ArticleFeature } from '@/components/article-feature'
import { SectionLabel } from '@/components/section-label'
import { articles } from '@/lib/articles'

export function ArticlesSection() {
  const featuredArticle = articles[0]

  return (
    <section id="clanky" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <SectionLabel>Články</SectionLabel>
          <h2 className="mt-4 max-w-3xl text-pretty text-[clamp(2.25rem,6vw,3rem)] font-bold leading-[1.05] tracking-[-0.04em]">
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

      <div className="mt-10 lg:mt-12">
        <ArticleFeature article={featuredArticle} />
      </div>
    </section>
  )
}
