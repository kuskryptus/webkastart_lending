'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import tornPaperEdge from '@/public/torn-paper-edge.png'

type PaperEdgeProps = {
  variant: 'hero' | 'projects'
}

export function PaperEdge({ variant }: PaperEdgeProps) {
  const [loaded, setLoaded] = useState(false)
  const isHero = variant === 'hero'
  const handleImageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  return (
    <Image
      src={tornPaperEdge}
      alt=""
      placeholder="blur"
      preload={isHero}
      loading={isHero ? undefined : 'eager'}
      sizes="(max-width: 1023px) 210vw, 100vw"
      data-loaded={loaded}
      ref={handleImageRef}
      onLoad={() => setLoaded(true)}
      className={`${isHero ? 'hero-paper-edge z-[3]' : 'projects-paper-edge z-0'} pointer-events-none absolute h-auto max-w-none select-none`}
    />
  )
}
