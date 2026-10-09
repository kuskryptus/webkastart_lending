'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import heroLaptop from '@/public/postly-laptop-stone-mefi-v2.png'

export function HeroLaptop() {
  const [loaded, setLoaded] = useState(false)
  const handleImageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  return (
    <Image
      src={heroLaptop}
      alt="Aplikácia na správu sociálnych sietí zobrazená na notebooku"
      loading="eager"
      fetchPriority="high"
      sizes="(max-width: 1023px) 90vw, (min-width: 1280px) 700px, 52vw"
      data-loaded={loaded}
      ref={handleImageRef}
      onLoad={() => setLoaded(true)}
      className="hero-laptop order-1 h-auto w-full object-contain lg:mx-auto lg:mt-20 lg:w-[96%] lg:-translate-y-3"
    />
  )
}
