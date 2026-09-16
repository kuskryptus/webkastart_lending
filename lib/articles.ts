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
    slug: 'preco-moze-mat-landing-page-zmysel-pre-restauraciu',
    title: 'Prečo môže mať landing page zmysel pre vašu reštauráciu?',
    excerpt:
      'Landing page môže zachytiť hosťa práve vtedy, keď hľadá obed, rezerváciu, donášku, catering alebo priestor na oslavu.',
    category: 'Gastro',
    coverImage: '/articles/preco-landing-page-pre-restauraciu.jpg',
    coverAlt: 'Prestretý stôl s jedlom v príjemnej modernej reštaurácii',
    publishedAt: '2026-09-16',
  },
  {
    slug: 'jeden-obycajny-bicykel-v-servise',
    title: 'Jeden bicykel. Veľa administratívy.',
    excerpt:
      'Jeden servisný prípad ukazuje, ako rýchlo sa z opravy bicykla stane problém s dielmi, schvaľovaním a prehľadom.',
    category: 'Cyklo servis',
    coverImage: '/articles/jeden-obycajny-bicykel-v-servise.jpg',
    coverAlt: 'Horský bicykel na servisnom stojane v cykloservise',
    publishedAt: '2026-09-02',
  },
] satisfies Article[]
