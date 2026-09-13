import type { MetadataRoute } from 'next'
import { articles } from '@/lib/articles'
import { siteImageUrl, siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/clanky/${article.slug}`,
    lastModified: article.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
    images: [`${siteUrl}${article.coverImage}`],
  }))

  return [
    {
      url: siteUrl,
      changeFrequency: 'monthly',
      priority: 1,
      images: [siteImageUrl],
    },
    {
      url: `${siteUrl}/projekty`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/clanky`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/rezervacia`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...articlePages,
  ]
}
