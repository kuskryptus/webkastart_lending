'use client'

import { type TouchEvent, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Maximize2,
  Settings2,
  X,
} from 'lucide-react'
import { ContactFormLink } from '@/components/contact-form-link'
import type { Project } from '@/components/projects'
import { ProjectVisual } from '@/components/project-visual'

const expenseWorkflow = [
  { label: 'Bloček / výpis', icon: FileText },
  { label: 'Spracovanie', icon: Settings2 },
  { label: 'Kontrola', icon: CheckCircle2 },
  { label: 'Prehľad', icon: BarChart3 },
]

function ProjectNavButtons({
  className = '',
  onNext,
  onPrevious,
}: {
  className?: string
  onNext: () => void
  onPrevious: () => void
}) {
  const buttonClassName =
    'inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35'

  return (
    <div className={`items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onPrevious}
        className={buttonClassName}
        aria-label="Predchádzajúci projekt"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        className={buttonClassName}
        aria-label="Ďalší projekt"
      >
        <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )
}

function ProjectDots({
  activeIndex,
  count,
  onSelect,
}: {
  activeIndex: number
  count: number
  onSelect: (index: number) => void
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label="Výber projektu"
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          className="group inline-flex size-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
          aria-label={`Zobraziť projekt ${index + 1} z ${count}`}
          aria-current={index === activeIndex ? 'true' : undefined}
        >
          <span
            className={`h-1.5 rounded-full transition-all duration-200 ${
              index === activeIndex
                ? 'w-4 bg-brand'
                : 'w-1.5 bg-foreground/20 group-hover:bg-foreground/35'
            }`}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  )
}

function ProjectSlide({
  activeIndex,
  onOpenDetail,
  onNext,
  onPrevious,
  onSelect,
  project,
  projectCount,
}: {
  activeIndex: number
  onOpenDetail: () => void
  onNext: () => void
  onPrevious: () => void
  onSelect: (index: number) => void
  project: Project
  projectCount: number
}) {
  if (project.caseStudy) {
    return (
      <ExpenseCaseStudySlide
        activeIndex={activeIndex}
        caseStudy={project.caseStudy}
        onNext={onNext}
        onPrevious={onPrevious}
        onSelect={onSelect}
        project={project}
        projectCount={projectCount}
      />
    )
  }

  const isHashtagScope = project.scope.startsWith('#')

  return (
    <article id={project.slug} className="project-slide-enter">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12 xl:gap-16">
        <div className="max-w-xl">
          <div className="flex min-h-9 items-center gap-4">
            <p className="flex min-w-0 items-center gap-2 text-[12px] font-bold uppercase tracking-[0.11em] text-brand sm:text-[13px] sm:tracking-[0.12em]">
              <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <span className="truncate">{project.category}</span>
            </p>
          </div>
          <h3 className="mt-3 max-w-[15ch] text-pretty text-[clamp(1.8rem,8vw,2.3rem)] font-bold leading-[1.03] tracking-[-0.035em] sm:mt-[18px] lg:text-[2.75rem] xl:text-5xl">
            {project.title}
          </h3>
          <p className="mt-3 text-[15px] leading-[1.5] text-muted-foreground sm:mt-5 sm:text-[17px] sm:leading-[1.55] lg:max-w-lg">
            {project.summary}
          </p>

          <div className="mt-7 hidden border-t border-black/[0.08] pt-6 lg:block">
            <p className="max-w-lg text-[15px] font-medium leading-relaxed text-foreground">
              {project.result}
            </p>
            <p
              className={`mt-4 ${
                isHashtagScope
                  ? 'text-[12px] font-semibold leading-relaxed tracking-normal text-brand'
                  : 'text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground'
              }`}
            >
              {project.scope}
            </p>
          </div>
        </div>

        <div className="bg-[radial-gradient(circle_at_50%_50%,rgba(95,82,232,0.07),transparent_66%)]">
          <div className="flex items-center justify-start gap-3 pb-3 sm:pb-4">
            <ProjectDots activeIndex={activeIndex} count={projectCount} onSelect={onSelect} />
            <ProjectNavButtons
              className="flex shrink-0"
              onNext={onNext}
              onPrevious={onPrevious}
            />
          </div>
          {project.showcase.interactive ? (
            <div className="relative w-full" aria-label={`Interaktívna ukážka projektu ${project.title}`}>
              <ProjectVisual compactMobile priority showcase={project.showcase} />
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenDetail}
              className="group relative block w-full cursor-zoom-in focus-visible:outline-none"
              aria-label={`Zväčšiť ukážku projektu ${project.title}`}
            >
              <ProjectVisual compactMobile priority showcase={project.showcase} />
              <span className="absolute right-1.5 top-1.5 inline-flex size-8 items-center justify-center gap-1.5 rounded-full bg-background/92 text-[11px] font-semibold text-foreground shadow-[0_2px_12px_rgb(24_23_22_/_8%)] backdrop-blur transition-colors group-hover:bg-brand group-hover:text-white group-focus-visible:ring-2 group-focus-visible:ring-brand/45 group-focus-visible:ring-offset-2 sm:right-3 sm:top-3 sm:size-auto sm:px-2.5 sm:py-1.5 lg:hidden">
                <Maximize2 className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Detail</span>
              </span>
            </button>
          )}
        </div>

        <div className="border-t border-black/[0.08] pt-6 lg:hidden">
          <p className="text-[15px] font-medium leading-relaxed text-foreground">
            {project.result}
          </p>
          <p
            className={`mt-4 ${
              isHashtagScope
                ? 'text-[12px] font-semibold leading-relaxed tracking-normal text-brand'
                : 'text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground'
            }`}
          >
            {project.scope}
          </p>
        </div>
      </div>
    </article>
  )
}

function ExpenseCaseStudySlide({
  activeIndex,
  caseStudy,
  onNext,
  onPrevious,
  onSelect,
  project,
  projectCount,
}: {
  activeIndex: number
  caseStudy: NonNullable<Project['caseStudy']>
  onNext: () => void
  onPrevious: () => void
  onSelect: (index: number) => void
  project: Project
  projectCount: number
}) {
  return (
    <div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="flex min-w-0 items-center gap-2 text-[12px] font-bold uppercase tracking-[0.11em] text-brand sm:text-[13px] sm:tracking-[0.12em]">
          <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
          <span>{project.category}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <ProjectDots activeIndex={activeIndex} count={projectCount} onSelect={onSelect} />
          <ProjectNavButtons className="hidden sm:flex" onNext={onNext} onPrevious={onPrevious} />
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {caseStudy.name}
          </p>
          <h3 className="mt-3 max-w-[18ch] text-pretty text-[clamp(2rem,7vw,3rem)] font-bold leading-[1.03] tracking-[-0.04em]">
            {project.title}
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
          <div className="border-t border-black/[0.08] pt-4">
            <h4 className="text-sm font-semibold text-foreground">Problém</h4>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {caseStudy.problem}
            </p>
          </div>
          <div className="border-t border-black/[0.08] pt-4">
            <h4 className="text-sm font-semibold text-foreground">Riešenie</h4>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {caseStudy.solution}
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="expense-workflow-title" className="mt-10">
        <h4 id="expense-workflow-title" className="sr-only">Ako funguje spracovanie výdavkov</h4>
        <ol className="grid gap-3 sm:grid-cols-4 sm:gap-0">
          {expenseWorkflow.map(({ icon: Icon, label }, index) => (
            <li
              key={label}
              className="relative flex items-center gap-3 border-t border-black/[0.08] py-3 sm:border-y sm:px-4 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  0{index + 1}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-foreground">{label}</span>
              </span>
              {index < expenseWorkflow.length - 1 ? (
                <ArrowRight
                  className="absolute right-1 hidden size-4 translate-x-1/2 text-foreground/25 sm:block"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-14">
        <div
          className="bg-[radial-gradient(circle_at_50%_50%,rgba(95,82,232,0.07),transparent_66%)]"
          aria-label={`Interaktívna ukážka projektu ${project.title}`}
        >
          <ProjectVisual compactMobile priority showcase={project.showcase} />
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-brand">Výsledok</p>
          <p className="mt-2 max-w-xl text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            {project.result}
          </p>

          <section aria-labelledby="expense-includes-title" className="mt-7 border-t border-black/[0.08] pt-6">
            <h4 id="expense-includes-title" className="text-sm font-semibold text-foreground">
              Čo riešenie obsahuje
            </h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {caseStudy.includes.map((item) => (
                <li key={item} className="rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="expense-comparison-title" className="mt-7 border-t border-black/[0.08] pt-6">
            <h4 id="expense-comparison-title" className="sr-only">Predtým a potom</h4>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Predtým</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{caseStudy.before}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">Potom</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{project.result}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section aria-labelledby="expense-work-title" className="mt-9 border-t border-black/[0.08] pt-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(140px,0.25fr)_1fr] lg:items-start lg:gap-8">
          <h4 id="expense-work-title" className="text-sm font-semibold text-foreground">Moja práca</h4>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {caseStudy.work.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-brand" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="mt-9 rounded-2xl border border-brand/10 bg-brand-soft/70 px-5 py-6 sm:px-7 sm:py-7">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-pretty text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Máte vo firme podobný proces, ktorý dnes robíte ručne?
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Podobným spôsobom viem navrhnúť jednoduchý interný nástroj alebo automatizáciu aj pre váš proces.
            </p>
          </div>
          <ContactFormLink
            message="Dobrý deň, chcel/a by som prebrať firemný proces, ktorý dnes robíme ručne."
            className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            Prebrať môj proces
            <ArrowRight className="size-4" aria-hidden="true" />
          </ContactFormLink>
        </div>
      </aside>

      <ProjectNavButtons className="mt-5 flex justify-end sm:hidden" onNext={onNext} onPrevious={onPrevious} />
    </div>
  )
}

export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const activeProject = projects[activeIndex]

  const goToProject = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + projects.length) % projects.length)
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return
    }

    event.preventDefault()
    goToProject(deltaX < 0 ? 1 : -1)
  }

  return (
    <Dialog.Root open={detailOpen} onOpenChange={setDetailOpen}>
      <div className="mt-8 sm:mt-10">
        <div
          className="border-y border-black/[0.08] py-5 sm:py-6 lg:py-4"
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <ProjectSlide
            key={activeProject.slug}
            activeIndex={activeIndex}
            onOpenDetail={() => setDetailOpen(true)}
            onNext={() => goToProject(1)}
            onPrevious={() => goToProject(-1)}
            onSelect={setActiveIndex}
            project={activeProject}
            projectCount={projects.length}
          />
        </div>

        <p className="sr-only" aria-live="polite">
          Zobrazený projekt: {activeProject.title}
        </p>
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-foreground/45 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 grid place-items-center sm:p-5">
          <Dialog.Popup className="relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground outline-none transition-all data-[ending-style]:scale-[0.985] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.985] data-[starting-style]:opacity-0 sm:h-[min(92dvh,860px)] sm:max-w-7xl sm:rounded-3xl sm:shadow-[0_28px_90px_rgb(24_23_22_/_24%)]">
            <div className="flex shrink-0 items-start justify-between gap-5 px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
                  {activeProject.category}
                </p>
                <Dialog.Title className="mt-1 line-clamp-2 text-pretty text-base font-semibold leading-tight tracking-tight sm:text-xl">
                  {activeProject.title}
                </Dialog.Title>
              </div>
              <Dialog.Close
                aria-label="Zavrieť detail projektu"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
              >
                <X className="size-4" aria-hidden="true" />
              </Dialog.Close>
            </div>

            <Dialog.Description className="sr-only">
              Zväčšená ukážka projektu {activeProject.title}
            </Dialog.Description>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-secondary/20 px-3 py-4 sm:px-8 sm:py-6">
              <ProjectVisual detail showcase={activeProject.showcase} />
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
