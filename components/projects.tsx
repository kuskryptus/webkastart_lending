import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProjectCarousel } from '@/components/project-carousel'
import { ProjectVisual, type ProjectShowcase } from '@/components/project-visual'
import { SectionLabel } from '@/components/section-label'

export type Project = {
  slug: string
  category: string
  title: string
  summary: string
  result: string
  scope: string
  showcase: ProjectShowcase
}

export const projects: Project[] = [
  {
    slug: 'mirela-interny-system',
    category: 'Interný systém',
    title: 'Mirela - evidencia práce a materiálov',
    summary: 'Mobilný interný nástroj pre pracovníkov, pracoviská, materiály a odpracované hodiny.',
    result: 'Jedna aplikácia namiesto roztrúsených tabuliek a manuálnej evidencie.',
    scope: 'Mobilná aplikácia · evidencia · import dát',
    showcase: {
      src: '/portfolio/mirela-materials.jpg',
      alt: 'Správa materiálov v aplikácii Mirela',
      imageClassName: 'object-top',
    },
  },
  {
    slug: 'financny-prehlad-vydavkov',
    category: 'Osobná evidencia',
    title: 'Výdavky pod kontrolou za pár sekúnd',
    summary: 'Jednoduché zapisovanie výdavkov, kategórie a rýchla orientácia v tom, kam idú peniaze.',
    result: 'Prehľadná mobilná aplikácia s históriou, štatistikami a rýchlym skenovaním bločkov.',
    scope: 'Mobilná aplikácia · financie · skenovanie',
    showcase: {
      src: '/portfolio/expenses-overview.jpg',
      alt: 'Prehľad výdavkov v mobilnej aplikácii',
      imageClassName: 'object-top',
    },
  },
  {
    slug: 'pdf-text-citacka',
    category: 'Produktivita',
    title: 'Čítačka PDF a vlastného obsahu',
    summary: 'Mobilná čítačka pre PDF, vložený text alebo odkaz s jednoduchým režimom čítania.',
    result: 'Obsah sa dá rýchlo importovať, čítať a ovládať v tmavom, sústredenom rozhraní.',
    scope: 'Mobilná aplikácia · reader · import obsahu',
    showcase: {
      src: '/portfolio/reader-view.jpg',
      alt: 'Obrazovka mobilnej čítačky s textom',
      imageClassName: 'object-center',
    },
  },
  {
    slug: 'new-level-youth-web',
    category: 'Webová stránka',
    title: 'New Level Youth web',
    summary: 'Mobilne ladený web pre mládežnícke stretnutia s výraznou hero sekciou a jasným registračným tlačidlom.',
    result: 'Návštevník hneď pochopí, kedy sa akcia deje, pre koho je určená a aký je ďalší krok.',
    scope: 'Web · landing page · registrácia',
    showcase: {
      src: '/portfolio/newlevel-youth.jpg',
      alt: 'Mobilná stránka New Level Youth',
      imageClassName: 'object-top',
      variant: 'mobile',
    },
  },
  {
    slug: 'automatizovany-vyhladavac-ponuk',
    category: 'Automatizácia',
    title: 'Vyhľadávač pracovných ponúk',
    summary: 'Automatizovaný monitor pracovných ponúk, ktorý sledoval vybrané sektory a posielal nové výsledky priamo do správy.',
    result: 'Nové ponuky sa dali rýchlo otvoriť bez manuálneho preklikávania pracovných portálov.',
    scope: 'Automatizácia · monitoring · notifikácie',
    showcase: {
      src: '/portfolio/job-offer-monitor.png',
      alt: 'Správy s automaticky nájdenými pracovnými ponukami',
      variant: 'square',
    },
  },
  {
    slug: 'fakturacny-wizard-szco',
    category: 'Desktop nástroj',
    title: 'Fakturačný wizard SZČO',
    summary: 'Lokálny pracovný nástroj na evidenciu faktúr, zákazníkov a PDF výstupov bez zložitého účtovného systému.',
    result: 'Používateľ má históriu faktúr, stav úhrady a cestu k súborom na jednom mieste.',
    scope: 'Desktop aplikácia · faktúry · lokálne dáta',
    showcase: {
      src: '/portfolio/invoice-wizard.png',
      alt: 'História faktúr vo fakturačnom wizardovi',
      variant: 'desktop',
    },
  },
]

export function ProjectFeatureShowcase({
  priority = false,
  project,
  reversed = false,
}: {
  priority?: boolean
  project: Project
  reversed?: boolean
}) {
  return (
    <article
      id={project.slug}
      className="scroll-mt-8 border-t border-border py-12 first:border-t-0 first:pt-0 lg:py-16"
    >
      <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-center lg:gap-10">
        <div className={`max-w-xl ${reversed ? 'lg:order-2 lg:pl-4' : ''}`}>
          <span className="inline-flex w-fit items-center rounded-md bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
            {project.category}
          </span>
          <h3 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
          <p className="mt-5 text-sm font-medium leading-relaxed text-foreground">
            {project.result}
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {project.scope}
          </p>
        </div>

        <div className={reversed ? 'lg:order-1' : ''}>
          <ProjectVisual priority={priority} showcase={project.showcase} />
        </div>
      </div>
    </article>
  )
}

export function Projects() {
  return (
    <section id="projekty" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <SectionLabel>Moje projekty</SectionLabel>
          <h2 className="mt-4 max-w-3xl text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
            Produkty v praxi
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Každý projekt ukazujem cez rozhranie a krátke funkčné body, aby bolo hneď jasné, čo aplikácia rieši.
          </p>
        </div>
        <Link
          href="/projekty"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          Zobraziť viac detailov
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <ProjectCarousel projects={projects} />
    </section>
  )
}
