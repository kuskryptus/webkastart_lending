export type Article = {
  slug: string
  title: string
  excerpt: string
  category: string
  coverImage: string
  coverAlt: string
  publishedAt: string
}

export const articles = [
  {
    slug: 'jeden-obycajny-bicykel-v-servise',
    title: 'Jeden bicykel. Veľa administratívy.',
    excerpt:
      'Jeden servisný prípad ukazuje, ako rýchlo sa z opravy bicykla stane problém s dielmi, schvaľovaním a prehľadom.',
    category: 'Cyklo servis',
    coverImage: '/articles/jeden-obycajny-bicykel-v-servise.jpg',
    coverAlt: 'Bicykel Cube na servisnom stojane v cykloservise',
    publishedAt: '2026-09-02',
  },
] satisfies Article[]
