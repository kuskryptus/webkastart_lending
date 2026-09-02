import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Clock3,
  PackageSearch,
  Wrench,
  X,
} from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { articles } from '@/lib/articles'
import { siteName, siteUrl } from '@/lib/site'

const article = articles[0]
const articleUrl = `${siteUrl}/clanky/${article.slug}`

export const metadata: Metadata = {
  title: `${article.title} — WebkaStart`,
  description: article.excerpt,
  alternates: { canonical: articleUrl },
  openGraph: {
    type: 'article',
    locale: 'sk_SK',
    url: articleUrl,
    siteName,
    title: article.title,
    description: article.excerpt,
    publishedTime: article.publishedAt,
    images: [
      {
        url: article.coverImage,
        width: 1832,
        height: 858,
        alt: article.coverAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.excerpt,
    images: [article.coverImage],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.excerpt,
  image: `${siteUrl}${article.coverImage}`,
  datePublished: article.publishedAt,
  mainEntityOfPage: articleUrl,
  publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-7 mt-16 text-balance text-3xl font-bold leading-tight tracking-[-0.035em] text-foreground sm:mt-20 sm:text-4xl">
      {children}
    </h2>
  )
}

function StoryQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-9 border-l-2 border-brand pl-5 text-pretty text-xl font-medium leading-relaxed text-foreground sm:pl-7 sm:text-2xl">
      {children}
    </blockquote>
  )
}

function DecisionList({ final = false }: { final?: boolean }) {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="grid divide-y divide-border px-5 sm:px-6">
        <p className="flex items-center gap-3 py-3.5">
          <Check className="size-4 shrink-0 text-brand" aria-hidden="true" />
          <span>Platničky — schválené</span>
        </p>
        <p className="flex items-center gap-3 py-3.5">
          <Check className="size-4 shrink-0 text-brand" aria-hidden="true" />
          <span>Reťaz — schválená</span>
        </p>
        <p className="flex items-center gap-3 py-3.5 text-muted-foreground">
          <X className="size-4 shrink-0" aria-hidden="true" />
          <span>Kazeta — {final ? 'nevymieňať' : 'zatiaľ nevymieňať'}</span>
        </p>
        <p className="flex items-center gap-3 py-3.5">
          <Check className="size-4 shrink-0 text-brand" aria-hidden="true" />
          <span>Lanko — schválené</span>
        </p>
        <p className="flex items-center gap-3 py-3.5">
          <Check className="size-4 shrink-0 text-brand" aria-hidden="true" />
          <span>Predný náboj — {final ? 'servisovať' : 'skontrolovať a nastaviť'}</span>
        </p>
      </div>
    </div>
  )
}

export default function BicycleServiceArticlePage() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <SiteHeader />

      <article>
        <header className="mx-auto max-w-6xl px-5 pb-10 pt-6 sm:px-6 sm:pb-14 lg:pb-16 lg:pt-10">
          <Link
            href="/clanky"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Všetky články
          </Link>

          <div className="mt-10 max-w-5xl sm:mt-14">
            <span className="inline-flex w-fit items-center rounded-md bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
              {article.category}
            </span>
            <h1 className="mt-5 text-balance text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.96] tracking-[-0.055em]">
              {article.title}
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {article.excerpt}
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl bg-secondary sm:mt-14 lg:rounded-3xl">
            <Image
              src={article.coverImage}
              alt={article.coverAlt}
              width={1832}
              height={858}
              priority
              sizes="(min-width: 1152px) 1152px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 40px)"
              className="aspect-[1832/858] w-full object-cover"
            />
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-5 pb-20 sm:px-6 lg:pb-28">
          <div className="space-y-6 text-[1.05rem] leading-[1.85] text-foreground/85 sm:text-lg sm:leading-[1.9]">
            <p>
              Je utorok ráno a Martin má v servise už niekoľko bicyklov z predchádzajúcich
              dní. Niektoré čakajú na opravu, pri ďalších chýba diel a dva hotové bicykle si
              ešte zákazníci nevyzdvihli.
            </p>

            <p>Krátko po otvorení prichádza Peter Novák s bicyklom Cube Reaction.</p>

            <StoryQuote>
              „Pri zábere mi preskakuje reťaz, zadná brzda už skoro nebrzdí a keď ho budete
              mať na stojane, pozrite prosím aj predné koleso. Zdá sa mi, že tam je nejaká
              vôľa.“
            </StoryQuote>

            <p>
              Martin bicykel prevezme a potrebuje si zapísať základné údaje: meno zákazníka,
              telefón, model bicykla a všetko, čo Peter opísal.
            </p>

            <div className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-semibold text-foreground">
                <ClipboardList className="size-4 text-brand" aria-hidden="true" />
                Príjem bicykla
              </div>
              <div className="px-5 py-5 sm:px-6">
                <p className="font-semibold text-foreground">Peter Novák · Cube Reaction</p>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Preskakuje reťaz · slabá zadná brzda · vôľa v prednom kolese
                </p>
              </div>
            </div>

            <p>
              Peter sa ešte spýta, kedy približne bude bicykel hotový. Martin mu presný
              termín povedať nevie. Pred ním čakajú ďalšie bicykle a až po diagnostike bude
              jasné, čo všetko bude tento konkrétny potrebovať.
            </p>

            <p>Bicykel teda zaradí medzi ostatné a pokračuje v práci.</p>

            <SectionHeading>Bicykel na stojane</SectionHeading>

            <p>
              O niekoľko hodín sa Martin dostane k Petrovmu bicyklu. Pri kontrole však
              zisťuje, že pôvodný zoznam problémov bol iba začiatok.
            </p>

            <p>
              Zadné brzdové platničky sú prakticky na konci. Reťaz je výrazne vytiahnutá a
              opotrebovanie je viditeľné už aj na kazete. Vôľa v prednom kolese tam skutočne
              je a pri kontrole radenia si Martin všimne aj poškodené lanko.
            </p>

            <p className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
              Z pôvodného „pozrite brzdu, reťaz a predné koleso“ tak vznikne podstatne väčšia
              zákazka.
            </p>

            <div className="my-8 rounded-2xl border border-brand/15 bg-brand-soft/55 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                <Wrench className="size-4" aria-hidden="true" />
                Diagnostika
              </div>
              <ul className="mt-5 grid gap-3 text-foreground">
                {[
                  'výmena zadných brzdových platničiek,',
                  'výmena reťaze,',
                  'odporúčaná výmena kazety,',
                  'výmena lanka a nastavenie radenia,',
                  'kontrola a nastavenie predného náboja.',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p>
              A teraz prichádza časť práce, ktorú zákazník pri návšteve servisu väčšinou
              nevidí.
            </p>

            <p>
              Martin musí pri každej položke zistiť, či má potrebný diel skladom, koľko stojí
              a či ho vôbec môže bez súhlasu zákazníka vymeniť. Platničky a reťaz má. Správnu
              kazetu však nie a bude ju treba doobjednať.
            </p>

            <p>
              Zároveň potrebuje Petrovi vysvetliť, že rozsah opravy aj výsledná cena budú
              vyššie, než sa pôvodne predpokladalo.
            </p>

            <p>Z jedného bicykla tak postupne vzniká pomerne veľké množstvo informácií:</p>

            <div className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-semibold text-foreground">
                <PackageSearch className="size-4 text-brand" aria-hidden="true" />
                Diely a práca
              </div>
              <div className="divide-y divide-border px-5 sm:px-6">
                {[
                  'Platničky — skladom — 18 €',
                  'Reťaz — skladom — 25 €',
                  'Kazeta 11–51T — objednať — 55 €',
                  'Lanko + nastavenie — 15 €',
                  'Servis predného náboja — skontrolovať rozsah',
                ].map((item) => (
                  <p key={item} className="py-3.5 text-foreground">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <p>
              K tomu treba pripočítať prácu a pripraviť zákazníkovi zrozumiteľný odhad ceny.
            </p>

            <SectionHeading>A Peter môže rozhodnúť ešte inak</SectionHeading>

            <p>Peter nemusí odsúhlasiť všetko.</p>
            <p>Po vysvetlení situácie napríklad povie:</p>

            <StoryQuote>
              „Brzdy, reťaz a lanko určite spravte. Ak sa dá, kazetu by som zatiaľ nechal.“
            </StoryQuote>

            <p>
              V tej chvíli už nestačí vedieť iba to, čo je na bicykli pokazené. Martin
              potrebuje mať zaznamenané aj to, čo zákazník schválil a čo naopak robiť nemá.
            </p>

            <DecisionList />

            <p>
              Ak na bicykli zajtra pokračuje jeho kolega Tomáš, musí mať rovnaké informácie.
              Nemal by zisťovať, čo Martin včera s Petrom dohodol alebo či sa kazeta mala
              objednať.
            </p>

            <p className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
              A práve tu sa z jednoduchého servisu bicykla začína stávať problém s
              organizáciou informácií.
            </p>
          </div>
        </div>

        <section className="border-y border-border bg-secondary/65">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
            <h2 className="text-balance text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              Lenže v servise nie je iba jeden bicykel
            </h2>

            <div className="mt-9 space-y-6 text-[1.05rem] leading-[1.85] text-foreground/85 sm:text-lg sm:leading-[1.9]">
              <p>
                Kým Martin riešil Petrov Cube, Tomáš prijal ďalšie tri bicykle. Popoludní
                pribudnú ďalšie. Na konci dňa môže byť v servise desať či pätnásť
                rozpracovaných zákaziek a každá je v inom stave.
              </p>
              <p>
                Jankov Trek čaká na brzdový kotúč. Lucia priniesla Specialized na pravidelný
                servis a ešte neprešiel diagnostikou. Pri Michalovom Giant-e sa čaká na
                odsúhlasenie drahšej opravy. Petrov Cube môže pokračovať, ale kazeta sa podľa
                jeho rozhodnutia meniť nebude.
              </p>
              <p>
                Pri každom bicykli pritom treba držať pokope rovnaký typ informácií: kto ho
                priniesol, čo zákazník nahlásil, čo mechanik skutočne našiel, čo treba opraviť,
                aké diely sú potrebné, čo je skladom, čo treba objednať, akú cenu zákazník
                schválil a v akom stave sa zákazka práve nachádza.
              </p>
              <p>
                Jeden bicykel môže byť prijatý, ďalší čaká na diagnostiku, ďalší na
                schválenie, ďalší na diel, ďalší je v oprave a ďalší už čaká na vyzdvihnutie.
              </p>
              <p className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
                Samotná oprava bicykla teda nemusí byť najväčší organizačný problém.
              </p>
              <p className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
                Problém je udržať prehľad o všetkom, čo sa okolo desiatich rozpracovaných
                opráv priebežne mení.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-brand/10 bg-brand-soft/45">
          <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Jednoduchší pracovný proces
            </span>
            <h2 className="mx-auto mt-4 max-w-4xl text-balance text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Čo keby mal každý bicykel jedno miesto?
            </h2>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:py-28">
          <div className="space-y-6 text-[1.05rem] leading-[1.85] text-foreground/85 sm:text-lg sm:leading-[1.9]">
            <p>
              Peter prinesie rovnaký Cube Reaction a Martin vytvorí jednu servisnú zákazku.
            </p>

            <div className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ClipboardList className="size-4 text-brand" aria-hidden="true" />
                  Servisná zákazka
                </span>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                  Prijatý
                </span>
              </div>
              <div className="space-y-5 px-5 py-5 sm:px-6">
                <div>
                  <p className="font-semibold text-foreground">Peter Novák</p>
                  <p>Cube Reaction</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                    Nahlásené zákazníkom
                  </p>
                  <p className="mt-2 leading-relaxed">
                    Preskakovanie reťaze · slabá zadná brzda · vôľa v prednom kolese
                  </p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Stav: Prijatý</p>
              </div>
            </div>

            <p>
              Keď sa bicykel dostane na stojan, Martin otvorí tú istú zákazku. Nevytvára nový
              záznam a nič nemusí prepisovať. Iba doplní výsledok diagnostiky.
            </p>

            <div className="my-8 rounded-2xl border border-brand/15 bg-brand-soft/55 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                Zistené pri kontrole
              </p>
              <p className="mt-3 leading-relaxed text-foreground">
                Opotrebované platničky · vytiahnutá reťaz · opotrebovaná kazeta · poškodené
                lanko · vôľa predného náboja
              </p>
            </div>

            <p>
              K jednotlivým položkám pridá diely, cenu a dostupnosť. Na jednom mieste tak
              vidí, že platničky a reťaz sú skladom, zatiaľ čo kazetu by bolo potrebné
              objednať.
            </p>
            <p>
              Z toho istého záznamu vznikne návrh opravy pre Petra. Peter vidí, čo servis
              našiel, koľko jednotlivé položky stoja a môže potvrdiť, čo chce vykonať.
            </p>
            <p>Po jeho rozhodnutí zostane priamo pri bicykli zaznamenané:</p>

            <DecisionList final />

            <p>
              Keď na bicykli neskôr pokračuje Tomáš, nemusí sa Martina na nič pýtať. Otvorí
              zákazku a vidí, čo bolo diagnostikované, čo Peter schválil a čo sa má urobiť.
            </p>
            <p>
              Ak by Peter kazetu schválil a diel nebol skladom, zákazka by jednoducho prešla
              do stavu Čaká na diel a kazeta by sa objavila medzi dielmi, ktoré treba
              objednať. Po jej doručení sa môže bicykel vrátiť medzi zákazky pripravené na
              pokračovanie.
            </p>

            <SectionHeading>Jeden prehľad pre celý servis</SectionHeading>

            <p>
              Martin ráno nemusí prechádzať bicykle po dielni a rozmýšľať, čo sa pri ktorom
              včera riešilo. Otvorí servis a vidí napríklad:
            </p>

            <div className="my-8 grid gap-3 sm:grid-cols-2">
              {[
                { icon: ClipboardList, label: '3 čakajú na diagnostiku' },
                { icon: Clock3, label: '2 čakajú na schválenie' },
                { icon: PackageSearch, label: '3 čakajú na diely' },
                { icon: Wrench, label: '4 sú v oprave' },
                { icon: Check, label: '2 sú pripravené na vyzdvihnutie' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground shadow-sm"
                >
                  <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>

            <p>
              Otvorí konkrétny bicykel a pod ním nájde celý jeho príbeh — od toho, s čím
              zákazník prišiel, až po poslednú vykonanú prácu.
            </p>
            <p>
              Nejde pritom o nahradenie mechanika technológiou. Martin aj Tomáš stále
              diagnostikujú bicykle, komunikujú so zákazníkmi a rozhodujú, ako opravu
              vykonať.
            </p>

            <p className="pt-5 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
              Aplikácia má jednoduchú úlohu.
            </p>
            <p className="text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
              Drží všetko, čo patrí k jednému bicyklu, na jednom mieste.
            </p>
            <p>
              A keď takých bicyklov nie je jeden, ale pätnásť, práve vtedy to začína dávať
              zmysel.
            </p>
          </div>

          <aside className="mt-20 rounded-3xl border border-brand/10 bg-brand-soft/70 px-6 py-9 sm:px-10 sm:py-11">
            <h2 className="text-pretty text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Riešite vo firme niečo podobné?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Nemusí ísť o veľký systém. Niekedy stačí malé riešenie presne pre váš pracovný
              proces.
            </p>
            <Link
              href="/#kontakt-formular"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              Ozvať sa
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}
