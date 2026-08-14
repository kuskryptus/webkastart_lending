'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Project } from '@/components/projects'
import { ProjectVisual } from '@/components/project-visual'

function ProjectSlide({
  active,
  project,
}: {
  active: boolean
  project: Project
}) {
  return (
    <article
      id={project.slug}
      aria-hidden={!active}
      className="min-w-full px-0.5"
    >
      <div className="grid gap-8 lg:min-h-[560px] lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-12">
        <div className="max-w-xl">
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

        <ProjectVisual priority={active} showcase={project.showcase} />
      </div>
    </article>
  )
}

export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeProject = projects[activeIndex]

  const goToProject = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + projects.length) % projects.length)
  }

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToProject(-1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-secondary"
            aria-label="Predchádzajúci projekt"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goToProject(1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-secondary"
            aria-label="Ďalší projekt"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {projects.map((project, index) => (
            <ProjectSlide
              key={project.slug}
              active={index === activeIndex}
              project={project}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
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
