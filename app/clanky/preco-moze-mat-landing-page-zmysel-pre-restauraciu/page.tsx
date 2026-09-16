import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { articles } from '@/lib/articles'
import { siteName, siteUrl } from '@/lib/site'

const article = articles.find(
  ({ slug }) => slug === 'preco-moze-mat-landing-page-zmysel-pre-restauraciu',
)!
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

function SectionHeading({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-7 mt-16 flex items-start gap-4 text-balance text-3xl font-bold leading-tight tracking-[-0.035em] text-foreground sm:mt-20 sm:text-4xl">
      <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand sm:size-9">
        {number}
      </span>
      <span>{children}</span>
    </h2>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="my-7 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check className="mt-1.5 size-4 shrink-0 text-brand" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Example({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 border-l-2 border-brand bg-brand-soft/45 px-5 py-5 text-foreground sm:px-7 sm:py-6">
      {children}
    </div>
  )
}

export default function RestaurantLandingPageArticle() {
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
            <h1 className="mt-5 text-balance text-[clamp(2.75rem,7vw,6rem)] font-bold leading-[0.98] tracking-[-0.055em]">
              {article.title}
            </h1>
            <p className="mt-7 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
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
              Máte dobré jedlo, stálych zákazníkov, Google profil a pravdepodobne aj Facebook
              alebo Instagram.
            </p>
            <p>Možno si preto hovoríte:</p>
            <blockquote className="my-9 border-l-2 border-brand pl-5 text-pretty text-xl font-medium leading-relaxed text-foreground sm:pl-7 sm:text-2xl">
              „Načo mi je web? Ľudia nás poznajú a menu máme na Facebooku.“
            </blockquote>
            <p>
              Landing page však nemusí nahrádzať sociálne siete ani všetko, čo už dnes
              používate.
            </p>
            <p>
              Jej úlohou je hlavne zachytiť človeka vo chvíli, keď sa rozhoduje, kam pôjde
              jesť, chce si objednať jedlo, rezervovať stôl alebo hľadá priestor na oslavu.
            </p>
            <p>Tu je niekoľko konkrétnych situácií, v ktorých môže dávať zmysel.</p>

            <SectionHeading number={1}>Človek práve hľadá, kam ísť na obed</SectionHeading>
            <p>Je 11:30 a potenciálny zákazník zadá do Google napríklad:</p>
            <BulletList
              items={[
                'obed Spišská Nová Ves',
                'denné menu Spišská Nová Ves',
                'reštaurácia v okolí',
                'obedové menu',
                'pizza Spišská Nová Ves',
              ]}
            />
            <p>V tej chvíli ho už nemusíte presviedčať, že sa chce ísť najesť.</p>
            <p>On už reštauráciu hľadá.</p>
            <p>Vaša stránka by mu preto mala čo najrýchlejšie odpovedať:</p>
            <BulletList
              items={[
                'Čo dnes varíte?',
                'Koľko to stojí?',
                'Kde vás nájde?',
                'Dokedy máte otvorené?',
                'Môže si rezervovať stôl?',
              ]}
            />
            <p>
              Čím jednoduchšie tieto informácie nájde, tým jednoduchšia je jeho cesta k
              návšteve vašej reštaurácie.
            </p>

            <SectionHeading number={2}>Denné menu na jednom mieste</SectionHeading>
            <p>Možno každý deň pridávate aktuálne menu na Facebook alebo Instagram.</p>
            <p>Problém je, že príspevok postupne zapadne medzi ostatný obsah.</p>
            <p>Na vlastnej stránke môžete mať jednoduchú adresu:</p>
            <Example>
              <p className="font-semibold text-foreground">restauracia.sk/menu</p>
            </Example>
            <p>Zákazník potom vie:</p>
            <p className="text-xl font-semibold leading-relaxed text-foreground">
              „Keď chcem vedieť, čo dnes varia, nájdem to tu.“
            </p>
            <p>
              Zároveň nemusíte pri každej zmene volať človeku, ktorý vám vytvoril stránku.
              Môžete dostať jednoduchú administráciu:
            </p>
            <Example>
              <p className="font-semibold text-foreground">Pondelok → upraviť → uložiť</p>
            </Example>
            <p>
              Prípadne sa menu môže prepojiť s ďalšími systémami, ktoré už používate.
            </p>
            <p>Nejde teda iba o to „mať web“.</p>
            <p>
              Ide o to mať jedno miesto, kde zákazník vždy nájde aktuálnu ponuku.
            </p>

            <SectionHeading number={3}>Rezervácia stola</SectionHeading>
            <p>
              Je piatok 17:00. Partia šiestich ľudí chce ísť večer na večeru a jeden z nich
              nájde vašu reštauráciu.
            </p>
            <p>Potrebuje vedieť:</p>
            <p className="text-xl font-semibold leading-relaxed text-foreground">
              „Majú miesto pre šesť ľudí o siedmej?“
            </p>
            <p>
              Ak je jedinou možnosťou telefonát, musí nájsť číslo, zavolať, počkať, či niekto
              zdvihne, a následne vysvetliť čas a počet ľudí.
            </p>
            <p>Landing page môže mať výrazné tlačidlo:</p>
            <Example>
              <p className="font-semibold text-foreground">Rezervovať stôl →</p>
            </Example>
            <p>
              Zákazníka môže poslať priamo do vášho existujúceho rezervačného systému
              alebo jednoduchého formulára.
            </p>
            <p>
              Stránka tak nemusí byť iba prezentácia reštaurácie. Môže vám reálne
              privádzať rezervácie.
            </p>

            <SectionHeading number={4}>
              Turista alebo človek, ktorý vás vôbec nepozná
            </SectionHeading>
            <p>
              Iná situácia nastáva pri človeku, ktorý vašu reštauráciu ešte nikdy
              nenavštívil.
            </p>
            <p>Príde do mesta, otvorí Google Maps alebo vyhľadá „restaurant near me“.</p>
            <p>Nájde niekoľko možností a začne sa rozhodovať.</p>
            <p>Vaša landing page mu môže na jednom mieste ukázať:</p>
            <BulletList
              items={[
                'fotografie jedál a interiéru,',
                'typ kuchyne, menu a ceny,',
                'hodnotenia zákazníkov,',
                'adresu, otváracie hodiny a parkovanie,',
                'mapu, telefón a možnosť rezervácie.',
              ]}
            />
            <p>V turistických lokalitách môže dávať zmysel aj viac jazykov:</p>
            <p className="text-xl font-semibold tracking-wide text-foreground">SK / EN / DE / PL</p>
            <p>
              Zákazník tak nemusí hľadať jednotlivé informácie cez Google, Facebook a
              Instagram. Má všetko dôležité na jednom mieste.
            </p>

            <SectionHeading number={5}>„Máte niečo bezlepkové?“</SectionHeading>
            <p>Ľudia nemusia hľadať iba názov vašej reštaurácie. Môžu hľadať konkrétnu potrebu:</p>
            <BulletList
              items={[
                'bezlepková reštaurácia,',
                'vegetariánske jedlo alebo vegan menu,',
                'rodinná reštaurácia s detským kútikom,',
                'reštaurácia so psom alebo terasa,',
                'steaky, pizza alebo burgre.',
              ]}
            />
            <p>
              Ak niečo z toho ponúkate, bola by škoda, aby sa o tom zákazník dozvedel až po
              príchode.
            </p>
            <p>Na stránke môžete jasne komunikovať napríklad:</p>
            <Example>
              <p className="text-xl font-bold text-foreground">Máme aj bezlepkové možnosti</p>
              <p className="mt-2">Pozrite si jedlá označené priamo v našom menu.</p>
              <p className="mt-3 font-semibold text-brand">Pozrieť bezlepkové jedlá →</p>
            </Example>
            <p>
              Stránka tak nerieši iba otázku „kto sme“, ale odpovedá na konkrétnu potrebu
              zákazníka.
            </p>

            <SectionHeading number={6}>Oslavy, svadby, kary a firemné akcie</SectionHeading>
            <p>Toto už môže byť samostatná obchodná príležitosť.</p>
            <p>
              Nemusíte mať iba jednu všeobecnú stránku o reštaurácii. Ak organizujete
              oslavy, môžete mať samostatnú landing page:
            </p>
            <Example>
              <p className="text-xl font-bold text-foreground">
                Hľadáte priestor na rodinnú oslavu?
              </p>
              <ul className="mt-4 grid gap-1.5">
                <li>Kapacita do 50 osôb</li>
                <li>Vlastné menu</li>
                <li>Parkovanie a výzdoba</li>
                <li>Detský kútik</li>
                <li>Možnosť rezervácie celej miestnosti</li>
              </ul>
              <p className="mt-4 font-semibold text-brand">Nezáväzne sa opýtať na termín →</p>
            </Example>
            <p>
              Jedna získaná zákazka na oslavu môže mať pre reštauráciu omnoho vyššiu
              hodnotu než jedna návšteva na obed.
            </p>
            <p>Rovnaký princíp môže fungovať pre:</p>
            <BulletList
              items={[
                'svadby, oslavy a krstiny,',
                'stužkové a kary,',
                'firemné večierky a teambuildingy.',
              ]}
            />
            <p>
              Každá z týchto služieb môže mať vlastnú stránku vytvorenú presne pre človeka,
              ktorý ju hľadá.
            </p>

            <SectionHeading number={7}>Catering</SectionHeading>
            <p>
              Možno už catering robíte, ale veľká časť potenciálnych zákazníkov o tom vôbec
              nevie.
            </p>
            <p>Namiesto jednej informácie niekde na Facebooku môžete mať samostatnú ponuku:</p>
            <Example>
              <p className="text-xl font-bold text-foreground">
                Catering na vašu oslavu alebo firemnú akciu
              </p>
              <p className="mt-2">Pripravíme občerstvenie pre 10–100 ľudí.</p>
            </Example>
            <p>Stránka môže obsahovať:</p>
            <BulletList
              items={[
                'fotografie realizácií,',
                'ukážkové balíčky,',
                'čo dokážete zabezpečiť,',
                'oblasť rozvozu.',
              ]}
            />
            <p>A na konci: <strong className="text-foreground">Mám záujem o catering →</strong></p>
            <p>Zákazník môže rovno vyplniť dátum, počet ľudí, miesto, typ udalosti a telefón.</p>
            <p>
              Namiesto všeobecnej otázky „Dobrý deň, koľko stojí catering?“ tak dostanete
              základné informácie potrebné na vytvorenie konkrétnej ponuky.
            </p>

            <SectionHeading number={8}>Donáška a objednávky</SectionHeading>
            <p>
              Reštaurácia môže byť na donáškovej platforme, ale chce zákazníkom zároveň
              umožniť jednoduchý prístup k vlastnej objednávke.
            </p>
            <p>Landing page môže mať veľmi jednoduchú cestu:</p>
            <Example>
              <p className="font-semibold text-foreground">
                Vyber jedlo → Objednaj → Zaplať / vyzdvihni
              </p>
            </Example>
            <p>Ale nemusíme hneď stavať celý e-shop.</p>
            <p>Stránka môže najskôr fungovať ako rozcestník:</p>
            <Example>
              <p className="font-bold text-foreground">Objednať jedlo</p>
              <p className="mt-2">Donáška · Osobný odber · Telefonická objednávka</p>
            </Example>
            <p>Zákazník nemusí rozmýšľať, čo má urobiť.</p>

            <SectionHeading number={9}>Akcia na konkrétne obdobie</SectionHeading>
            <p>Možno organizujete kačacie hody, valentínske menu alebo Silvester 2026.</p>
            <p>Práve tu môže byť samostatná landing page veľmi užitočná.</p>
            <Example>
              <p className="text-xl font-bold text-foreground">Valentínske menu pre dvoch</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand">
                14. februára
              </p>
              <p className="mt-4">4-chodové menu · Welcome drink · Dezert</p>
              <p className="mt-2 text-xl font-bold text-foreground">49 € / pár</p>
              <p className="mt-4 font-semibold text-brand">Rezervovať stôl →</p>
            </Example>
            <p>
              Na túto konkrétnu stránku môžete následne posielať ľudí z Facebooku,
              Instagramu alebo platenej reklamy.
            </p>
            <p>
              Namiesto všeobecného profilu sa človek dostane priamo k ponuke, ktorá ho zaujala,
              a môže si rovno rezervovať stôl.
            </p>

            <SectionHeading number={10}>Darčekové poukazy</SectionHeading>
            <p>Predstavte si človeka, ktorý rozmýšľa: „Čo kúpim rodičom na Vianoce?“</p>
            <p>Vaša reštaurácia môže ponúkať napríklad:</p>
            <Example>
              <p className="text-xl font-bold text-foreground">Darčekový poukaz na večeru – 50 €</p>
              <p className="mt-4 font-semibold text-brand">Kúpiť poukaz →</p>
            </Example>
            <p>
              Landing page môže vysvetliť, čo poukaz obsahuje, dokedy platí, ako sa používa a
              kde ho zákazník dostane.
            </p>
            <p>
              Reštaurácia tak nemusí získavať tržbu iba vtedy, keď zákazník fyzicky sedí pri
              stole.
            </p>

            <SectionHeading number={11}>Otvárate novú reštauráciu</SectionHeading>
            <p>Pri novej prevádzke je situácia jednoduchá: ľudia vás ešte nepoznajú.</p>
            <p>Potrebujete im ukázať:</p>
            <BulletList
              items={[
                'Kto ste?',
                'Čo varíte?',
                'Kde vás nájdu?',
                'Kedy otvárate?',
                'Prečo by vás mali vyskúšať?',
              ]}
            />
            <p>Landing page môže byť vytvorená priamo okolo otvorenia:</p>
            <Example>
              <p className="text-xl font-bold text-foreground">
                Nová talianska reštaurácia v centre mesta
              </p>
              <p className="mt-2">
                Príďte ochutnať domácu pizzu z pece a čerstvé cestoviny.
              </p>
              <p className="mt-4 font-semibold text-brand">
                Pozrieť menu · Rezervovať stôl
              </p>
            </Example>
            <p>
              Následne môžete propagovať jednu konkrétnu adresu, na ktorej človek nájde všetky
              potrebné informácie.
            </p>

            <SectionHeading number={12}>„Ale my už web máme.“</SectionHeading>
            <p>Landing page automaticky neznamená, že potrebujete nový web.</p>
            <p>Dôležitejšia otázka je:</p>
            <p className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
              Pomáha váš súčasný web zákazníkovi urobiť to, čo potrebujete?
            </p>
            <p>Predstavte si, že chcete získavať viac rodinných osláv.</p>
            <p>Váš existujúci web môže pokojne zostať. Vytvorí sa iba samostatná stránka:</p>
            <Example>
              <p className="font-semibold text-foreground">restauracia.sk/oslavy</p>
            </Example>
            <p>
              A práve tú môžete propagovať cez Google, Facebook alebo Instagram. Landing page
              teda nemusí nahrádzať celý web. Môže byť predajným nástrojom pre jednu konkrétnu
              službu.
            </p>

            <SectionHeading number={13}>Google reklama + landing page</SectionHeading>
            <p>Predstavte si, že niekto vyhľadá „priestor na oslavu Spišská Nová Ves“.</p>
            <p>Vaša reklama môže hovoriť:</p>
            <Example>
              <p className="text-xl font-bold text-foreground">Priestory na rodinné oslavy</p>
              <p className="mt-2">Kapacita do 60 ľudí. Menu podľa dohody. Parkovanie.</p>
              <p className="mt-4 font-semibold text-brand">Zistiť voľný termín →</p>
            </Example>
            <p>
              Po kliknutí človeka nepošlete na všeobecnú domovskú stránku. Dostane sa priamo
              na stránku venovanú oslavám.
            </p>
            <p>Princíp je jednoduchý:</p>
            <p className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
              jeden typ zákazníka → jedna potreba → jedna ponuka → jedna hlavná akcia
            </p>
          </div>

          <section className="mt-20 border-y border-border py-14 sm:mt-24 sm:py-16">
            <h2 className="text-balance text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              Čo vám teda môže landing page reálne priniesť?
            </h2>
            <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {[
                ['Viac rezervácií', 'Uľahčí zákazníkovi rezervovať si stôl.'],
                ['Aktuálne menu', 'Zákazník okamžite nájde, čo dnes ponúkate.'],
                ['Viac návštev z Google', 'Stránka môže byť pripravená na lokálne vyhľadávanie.'],
                ['Viac objednávok', 'Zákazník sa jednoduchšie dostane k objednávke alebo donáške.'],
                [
                  'Viac dopytov na oslavy a firemné akcie',
                  'Samostatná stránka môže prezentovať služby s vyššou hodnotou.',
                ],
                [
                  'Menej zbytočných telefonátov',
                  'Otváracie hodiny, menu, parkovanie, alergény a rezervácie nájde hosť online.',
                ],
                [
                  'Lepšie využitie reklamy',
                  'Návštevník príde na stránku vytvorenú presne pre ponuku, na ktorú klikol.',
                ],
              ].map(([title, description]) => (
                <div key={title}>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-16 sm:pt-20">
            <h2 className="text-balance text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              Kedy teda landing page dáva zmysel?
            </h2>
            <div className="mt-8 space-y-6 text-[1.05rem] leading-[1.85] text-foreground/85 sm:text-lg sm:leading-[1.9]">
              <p>Nemusíte začínať otázkou: „Potrebujem landing page?“</p>
              <p>Skúste si namiesto toho odpovedať:</p>
              <BulletList
                items={[
                  'Odkiaľ k nám dnes chodia noví zákazníci?',
                  'Kde máme aktuálne menu?',
                  'Dá sa u nás rezervovať stôl online?',
                  'Robíme oslavy, firemné akcie alebo catering?',
                  'Máme donášku alebo osobný odber?',
                  'Robíme sezónne akcie?',
                  'Platíme Facebook, Instagram alebo Google reklamu?',
                ]}
              />
              <p>
                Ak pri niektorej z týchto oblastí vidíte priestor na zlepšenie, práve tam môže
                mať landing page svoje využitie.
              </p>
            </div>
          </section>

          <section className="mt-16 bg-secondary/65 px-5 py-9 sm:mt-20 sm:px-8 sm:py-11">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Jednoduchý princíp
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Problém → landing page → akcia → výsledok
            </h2>
            <div className="mt-7 divide-y divide-border">
              {[
                ['Ľudia nevidia denné menu', 'Stránka s menu', 'Návšteva reštaurácie', 'Tržba'],
                ['Ľudia telefonujú kvôli rezerváciám', 'Online rezervácia', 'Rezervovaný stôl', 'Tržba'],
                ['Robíte oslavy, ale veľa ľudí o tom nevie', 'Landing page „Oslavy“', 'Dopyt na termín', 'Zákazka'],
                ['Robíte catering', 'Cateringová landing page', 'Formulár', 'Zákazka'],
                [
                  'Robíte sezónne menu',
                  'Kampaňová landing page',
                  'Rezervácia',
                  'Obsadené stoly',
                ],
                ['Platíte reklamu', 'Špecializovaná landing page', 'Konkrétna akcia', 'Lepšie využitie návštevnosti'],
              ].map((flow) => (
                <div key={flow[0]} className="grid gap-2 py-5 text-sm sm:grid-cols-4 sm:gap-4">
                  {flow.map((item, index) => (
                    <div key={item} className={index === 0 ? 'font-semibold text-foreground' : ''}>
                      {index > 0 && <span className="mr-2 text-brand sm:hidden">→</span>}
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="pt-16 sm:pt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Hlavná myšlienka
            </p>
            <h2 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              Landing page nemusí byť iba pekná online vizitka
            </h2>
            <div className="mt-8 space-y-6 text-[1.05rem] leading-[1.85] text-foreground/85 sm:text-lg sm:leading-[1.9]">
              <p>Jej úlohou je zachytiť človeka vo chvíli, keď už niečo chce:</p>
              <p className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
                Chcem sa najesť. Chcem vidieť menu. Chcem rezervovať stôl. Chcem objednať
                jedlo. Hľadám priestor na oslavu. Potrebujem catering.
              </p>
              <p>A dostať ho čo najkratšou cestou od:</p>
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                „Hľadám…“ → „Rezervujem / objednávam / prichádzam / posielam dopyt.“
              </p>
            </div>
          </section>

          <aside className="mt-20 rounded-3xl border border-brand/10 bg-brand-soft/70 px-6 py-9 sm:px-10 sm:py-11">
            <h2 className="text-pretty text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Chcete zistiť, čo by dávalo zmysel pre vašu reštauráciu?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pozrieme sa na vašu ponuku, spôsob rezervácií aj to, odkiaľ k vám prichádzajú
              noví hostia. Bez zbytočne veľkého riešenia.
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
