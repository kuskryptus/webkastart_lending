'use client'

import { type TouchEvent, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import type { Project } from '@/components/projects'
import { ProjectVisual } from '@/components/project-visual'

function ProjectNavButtons({
  className = '',
  compact = false,
  onNext,
  onPrevious,
}: {
  className?: string
  compact?: boolean
  onNext: () => void
  onPrevious: () => void
}) {
  const buttonClassName = compact
    ? 'inline-flex size-9 items-center justify-center rounded-full bg-secondary/75 text-foreground transition-colors duration-200 hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35'
    : 'inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_2px_10px_rgb(24_23_22_/_5%)] transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-soft sm:size-11'

  return (
    <div className={`items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onPrevious}
        className={buttonClassName}
        aria-label="Predchádzajúci projekt"
      >
        <ArrowLeft className={compact ? 'size-3.5' : 'size-4'} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        className={buttonClassName}
        aria-label="Ďalší projekt"
      >
        <ArrowRight className={compact ? 'size-3.5' : 'size-4'} aria-hidden="true" />
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
      className="flex items-center justify-center gap-0.5 lg:hidden"
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
  return (
    <article id={project.slug} className="project-slide-enter">
      <div className="hidden h-12 items-center justify-between border-b border-black/[0.08] lg:flex">
        <p className="text-sm font-semibold tabular-nums tracking-[0.08em] text-muted-foreground">
          <span className="text-foreground">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="mx-2 text-border">/</span>
          {String(projectCount).padStart(2, '0')}
        </p>
        <ProjectNavButtons
          className="flex"
          onNext={onNext}
          onPrevious={onPrevious}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12 lg:pt-8 xl:gap-16">
        <div className="max-w-xl">
          <div className="flex min-h-9 items-center justify-between gap-4">
            <p className="flex min-w-0 items-center gap-2 text-[12px] font-bold uppercase tracking-[0.11em] text-brand sm:text-[13px] sm:tracking-[0.12em]">
              <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <span className="truncate">{project.category}</span>
            </p>
            <ProjectNavButtons
              compact
              className="flex shrink-0 lg:hidden"
              onNext={onNext}
              onPrevious={onPrevious}
            />
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
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
              {project.scope}
            </p>
          </div>
        </div>

        <div className="bg-[radial-gradient(circle_at_50%_50%,rgba(95,82,232,0.07),transparent_66%)]">
          <ProjectDots activeIndex={activeIndex} count={projectCount} onSelect={onSelect} />
          <button
            type="button"
            onClick={onOpenDetail}
            className="group relative block w-full cursor-zoom-in rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-4"
            aria-label={`Zväčšiť ukážku projektu ${project.title}`}
          >
            <ProjectVisual compactMobile priority showcase={project.showcase} />
            <span className="absolute right-1 top-1 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1.5 text-[11px] font-semibold text-foreground shadow-[0_2px_12px_rgb(24_23_22_/_8%)] backdrop-blur transition-colors group-hover:bg-brand group-hover:text-white sm:right-3 sm:top-3">
              <Maximize2 className="size-3.5" aria-hidden="true" />
              Detail
            </span>
          </button>
        </div>

        <div className="border-t border-black/[0.08] pt-6 lg:hidden">
          <p className="text-[15px] font-medium leading-relaxed text-foreground">
            {project.result}
          </p>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {project.scope}
          </p>
        </div>
      </div>
    </article>
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
