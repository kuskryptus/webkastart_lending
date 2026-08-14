import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SectionLabel } from '@/components/section-label'
import { ProjectFeatureShowcase, projects } from '@/components/projects'

export default function ProjectsPage() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:pb-24 lg:pt-14">
        <div className="max-w-3xl">
          <SectionLabel>Produktové ukážky</SectionLabel>
          <h1 className="mt-4 text-pretty text-4xl font-bold tracking-tight sm:text-5xl">
            Rozhrania, ktoré hovoria samé za seba.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Namiesto dlhého opisovania ukazujem konkrétne obrazovky a hlavné funkcie priamo na nich.
          </p>
        </div>

        <div className="mt-12">
          {projects.map((project, index) => (
            <ProjectFeatureShowcase
              key={project.slug}
              priority={index === 0}
              project={project}
              reversed={index % 2 === 1}
            />
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/#kontakt"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Mám podobný projekt
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
