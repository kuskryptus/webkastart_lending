import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/lib/articles'

export function ArticleFeature({
  article,
  compact = false,
  headingLevel = 'h3',
  priority = false,
}: {
  article: Article
  compact?: boolean
  headingLevel?: 'h2' | 'h3'
  priority?: boolean
}) {
  const Heading = headingLevel

  return (
    <Link
      href={`/clanky/${article.slug}`}
      aria-label={`Prečítať článok: ${article.title}`}
      className={`group block border-y border-border focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 ${
        compact ? 'py-6 sm:py-7' : 'py-7 sm:py-9'
      }`}
    >
      <article
        className={`grid gap-6 lg:items-center ${
          compact
            ? 'lg:grid-cols-[1.06fr_0.94fr] lg:gap-10'
            : 'lg:grid-cols-[1.28fr_0.72fr] lg:gap-12'
        }`}
      >
        <div className="overflow-hidden rounded-2xl bg-secondary">
          <Image
            src={article.coverImage}
            alt={article.coverAlt}
            width={1832}
            height={858}
            priority={priority}
            sizes="(min-width: 1024px) 704px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 40px)"
            className="aspect-[1832/858] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
          />
        </div>

        <div className={`max-w-xl ${compact ? 'lg:py-2' : 'lg:py-4'}`}>
          {compact ? (
            <span className="inline-flex w-fit items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand">
              <span className="h-px w-5 bg-brand/50" aria-hidden="true" />
              {article.category}
            </span>
          ) : (
            <span className="inline-flex w-fit items-center rounded-md bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
              {article.category}
            </span>
          )}
          <Heading
            className={`text-pretty font-bold leading-tight tracking-tight ${
              compact
                ? 'mt-3 text-3xl lg:text-[2.25rem]'
                : 'mt-4 text-3xl sm:text-4xl lg:text-[2.65rem]'
            }`}
          >
            {article.title}
          </Heading>
          <p
            className={`text-pretty text-base leading-relaxed text-muted-foreground ${
              compact ? 'mt-3' : 'mt-4'
            }`}
          >
            {article.excerpt}
          </p>
          <span
            className={`inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-brand ${
              compact ? 'mt-5' : 'mt-6'
            }`}
          >
            Prečítať
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </span>
        </div>
      </article>
    </Link>
  )
}
