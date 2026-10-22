import Image from 'next/image'
import tornPaperEdge from '@/public/torn-paper-edge.webp'

type PaperEdgeProps = {
  variant: 'hero' | 'projects'
}

export function PaperEdge({ variant }: PaperEdgeProps) {
  const isHero = variant === 'hero'

  return (
    <Image
      src={tornPaperEdge}
      alt=""
      placeholder={isHero ? 'empty' : 'blur'}
      unoptimized
      loading={isHero ? 'eager' : 'lazy'}
      sizes="(max-width: 1023px) 210vw, 100vw"
      className={`${isHero ? 'hero-paper-edge z-[3]' : 'projects-paper-edge z-0'} pointer-events-none absolute h-auto max-w-none select-none`}
    />
  )
}
