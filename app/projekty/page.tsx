import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SectionLabel } from '@/components/section-label'
import { projects } from '@/components/projects'

const filters = ['Všetky', 'Weby', 'Aplikácie', 'Interné systémy', 'Automatizácie', 'AI']

export default function ProjectsPage() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:pb-24 lg:pt-14">
        <div className="max-w-3xl">
          <SectionLabel>Katalóg projektov</SectionLabel>
          <h1 className="mt-4 text-pretty text-4xl font-bold tracking-tight sm:text-5xl">
            Vybrané riešenia, ktoré som navrhol a vytvoril.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Weby, aplikácie, interné systémy a automatizácie pripravené tak, aby sa dali ďalej rozširovať podľa potrieb projektu.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                index === 0
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <li
              id={project.slug}
              key={project.slug}
              className="scroll-mt-8 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border bg-secondary">
                {project.preview}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="inline-flex w-fit items-center rounded-md bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                  {project.category}
                </span>
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${project.iconClass}`}>
                  <project.icon className="size-4" aria-hidden="true" />
                </div>
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight">{project.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {project.problem}
              </p>

              <div className="mt-5 rounded-xl bg-secondary/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Výsledok
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                  {project.result}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>

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
