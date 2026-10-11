import Image from 'next/image'
import heroLaptop from '@/public/postly-laptop-stone-mefi-v2.webp'

export function HeroLaptop() {
  return (
    <Image
      src={heroLaptop}
      alt="Aplikácia na správu sociálnych sietí zobrazená na notebooku"
      preload
      unoptimized
      placeholder="blur"
      sizes="(max-width: 1023px) 90vw, (min-width: 1280px) 700px, 52vw"
      className="hero-laptop order-1 h-auto w-full object-contain lg:mx-auto lg:mt-20 lg:w-[96%] lg:-translate-y-3"
    />
  )
}
