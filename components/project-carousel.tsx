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
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_2px_10px_rgb(24_23_22_/_5%)] transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-soft sm:size-11 lg:size-12"
        aria-label="Predchádzajúci projekt"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_2px_10px_rgb(24_23_22_/_5%)] transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-soft sm:size-11 lg:size-12"
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
      <div className="flex min-h-14 items-center justify-between border-b border-black/[0.08] pb-5">
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

      <div className="grid gap-7 pt-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12 lg:pt-10 xl:gap-16">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {project.category}
          </p>
          <h3 className="mt-[18px] max-w-[15ch] text-pretty text-[clamp(1.875rem,8.5vw,2.5rem)] font-bold leading-[1.03] tracking-[-0.035em] lg:text-[2.75rem] xl:text-5xl">
            {project.title}
          </h3>
          <p className="mt-5 text-[17px] leading-[1.55] text-muted-foreground lg:max-w-lg">
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
          <ProjectVisual compactMobile priority showcase={project.showcase} />
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
        className="border-y border-black/[0.08] py-5 sm:py-6 lg:py-8"
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
