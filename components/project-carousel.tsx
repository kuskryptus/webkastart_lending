'use client'

import { type TouchEvent, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Project } from '@/components/projects'
import { ProjectVisual } from '@/components/project-visual'

function ProjectNavButtons({
  className = '',
  onNext,
  onPrevious,
}: {
  className?: string
  onNext: () => void
  onPrevious: () => void
}) {
  return (
    <div className={`items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onPrevious}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-[0_3px_12px_rgb(24_23_22_/_6%)] transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-soft sm:size-11"
        aria-label="Predchádzajúci projekt"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-[0_3px_12px_rgb(24_23_22_/_6%)] transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-soft sm:size-11"
        aria-label="Ďalší projekt"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function ProjectSlide({
  activeIndex,
  onNext,
  onPrevious,
  project,
  projectCount,
}: {
  activeIndex: number
  onNext: () => void
  onPrevious: () => void
  project: Project
  projectCount: number
}) {
  return (
    <article id={project.slug} className="project-slide-enter">
      <div className="mb-7 flex items-center justify-between border-b border-border/70 pb-5 sm:mb-8 sm:pb-6">
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-12 xl:gap-16">
        <div className="max-w-xl lg:pt-8">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {project.category}
          </p>
          <h3 className="mt-4 max-w-[13ch] text-pretty text-[clamp(2rem,9vw,2.625rem)] font-bold leading-[1.05] tracking-[-0.04em] sm:max-w-[15ch] lg:mt-5 lg:text-[3rem]">
            {project.title}
          </h3>
          <p className="mt-5 line-clamp-3 text-[17px] leading-[1.55] text-muted-foreground sm:text-lg lg:line-clamp-none lg:max-w-lg">
            {project.summary}
          </p>

          <div className="mt-6 hidden border-t border-border/70 pt-6 lg:block">
            <p className="max-w-lg text-[15px] font-medium leading-relaxed text-foreground">
              {project.result}
            </p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
              {project.scope}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_44%,rgba(95,82,232,0.09),transparent_57%)] sm:rounded-[2rem]">
          <ProjectVisual compactMobile priority showcase={project.showcase} />
        </div>

        <div className="border-t border-border/70 pt-5 lg:hidden">
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

    goToProject(deltaX < 0 ? 1 : -1)
  }

  return (
    <div className="mt-8 sm:mt-10">
      <div
        className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-5 shadow-[0_18px_60px_rgb(24_23_22_/_5%)] sm:rounded-[2rem] sm:p-8 lg:rounded-[2.5rem] lg:p-10 xl:p-12"
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
      >
        <ProjectSlide
          key={activeProject.slug}
          activeIndex={activeIndex}
          onNext={() => goToProject(1)}
          onPrevious={() => goToProject(-1)}
          project={activeProject}
          projectCount={projects.length}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        Zobrazený projekt: {activeProject.title}
      </p>
    </div>
  )
}
