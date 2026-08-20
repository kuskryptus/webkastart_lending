'use client'

import { type TouchEvent, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Project } from '@/components/projects'
import { ProjectVisual } from '@/components/project-visual'

function ProjectNavButtons({
  buttonClassName = '',
  className = '',
  iconClassName = 'size-4',
  onNext,
  onPrevious,
  tabIndex,
}: {
  buttonClassName?: string
  className?: string
  iconClassName?: string
  onNext: () => void
  onPrevious: () => void
  tabIndex?: 0 | -1
}) {
  return (
    <div className={`items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onPrevious}
        tabIndex={tabIndex}
        className={`inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-secondary ${buttonClassName}`}
        aria-label="Predchádzajúci projekt"
      >
        <ArrowLeft className={iconClassName} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        tabIndex={tabIndex}
        className={`inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-secondary ${buttonClassName}`}
        aria-label="Ďalší projekt"
      >
        <ArrowRight className={iconClassName} aria-hidden="true" />
      </button>
    </div>
  )
}

function ProjectDots({
  activeIndex,
  onSelect,
  projects,
  tabIndex,
}: {
  activeIndex: number
  onSelect: (index: number) => void
  projects: Project[]
  tabIndex?: 0 | -1
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label="Výber projektu">
      {projects.map((project, index) => (
        <button
          key={project.slug}
          type="button"
          onClick={() => onSelect(index)}
          tabIndex={tabIndex}
          className={`h-2.5 rounded-full transition-all ${
            index === activeIndex
              ? 'w-6 bg-brand'
              : 'w-2.5 bg-border hover:bg-muted-foreground/45'
          }`}
          aria-current={index === activeIndex ? 'true' : undefined}
          aria-label={`Zobraziť projekt ${index + 1}: ${project.category}`}
        />
      ))}
    </div>
  )
}

function MobileProjectControls({
  activeIndex,
  onNext,
  onPrevious,
  onSelect,
  projects,
  tabIndex,
}: {
  activeIndex: number
  onNext: () => void
  onPrevious: () => void
  onSelect: (index: number) => void
  projects: Project[]
  tabIndex?: 0 | -1
}) {
  return (
    <div className="mt-5 flex items-center justify-center gap-3 lg:hidden">
      <button
        type="button"
        onClick={onPrevious}
        tabIndex={tabIndex}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-secondary"
        aria-label="Predchádzajúci projekt"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
      </button>
      <ProjectDots
        activeIndex={activeIndex}
        onSelect={onSelect}
        projects={projects}
        tabIndex={tabIndex}
      />
      <button
        type="button"
        onClick={onNext}
        tabIndex={tabIndex}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-secondary"
        aria-label="Ďalší projekt"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function ProjectSlide({
  active,
  activeIndex,
  onNext,
  onPrevious,
  onSelect,
  project,
  projects,
}: {
  active: boolean
  activeIndex: number
  onNext: () => void
  onPrevious: () => void
  onSelect: (index: number) => void
  project: Project
  projects: Project[]
}) {
  return (
    <article
      id={project.slug}
      aria-hidden={!active}
      className="min-w-full px-0.5"
    >
      <div className="grid gap-5 lg:min-h-[560px] lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-x-12 lg:gap-y-0">
        <div className="max-w-xl lg:col-start-1 lg:row-start-1">
          <span className="inline-flex w-fit items-center rounded-md bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
            {project.category}
          </span>
          <h3 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
          <MobileProjectControls
            activeIndex={activeIndex}
            onNext={onNext}
            onPrevious={onPrevious}
            onSelect={onSelect}
            projects={projects}
            tabIndex={active ? 0 : -1}
          />
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <ProjectVisual compactMobile priority={active} showcase={project.showcase} />
        </div>

        <div className="max-w-xl lg:col-start-1 lg:row-start-2">
          <p className="text-sm font-medium leading-relaxed text-foreground lg:mt-5">
            {project.result}
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
    <div className="mt-6">
      <div className="mb-4 hidden items-center justify-between gap-4 lg:flex">
        <p className="text-sm font-medium text-muted-foreground">
          {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </p>
        <ProjectNavButtons
          className="flex"
          onNext={() => goToProject(1)}
          onPrevious={() => goToProject(-1)}
        />
      </div>

      <div
        className="overflow-hidden"
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
      >
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {projects.map((project, index) => (
            <ProjectSlide
              key={project.slug}
              active={index === activeIndex}
              activeIndex={activeIndex}
              onNext={() => goToProject(1)}
              onPrevious={() => goToProject(-1)}
              onSelect={setActiveIndex}
              project={project}
              projects={projects}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 hidden flex-wrap gap-2 lg:flex">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              index === activeIndex
                ? 'border-brand bg-brand-soft text-brand'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
            aria-current={index === activeIndex ? 'true' : undefined}
          >
            {project.category}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Zobrazený projekt: {activeProject.title}
      </p>
    </div>
  )
}
