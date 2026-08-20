import Image from 'next/image'

export type ProjectDevice = 'phone' | 'browser' | 'desktop'

export type ProjectShowcase = {
  alt: string
  device: ProjectDevice
  imageClassName?: string
  src: string
}

type MockupProps = {
  alt: string
  image: string
  imageClassName?: string
  preload?: boolean
}

export function PhoneMockup({ alt, image, imageClassName, preload }: MockupProps) {
  return (
    <div className="relative z-10 aspect-[9/19.5] w-[min(72vw,260px)] rounded-[2.65rem] bg-[#0b0b0b] p-[5px] shadow-[0_24px_64px_rgb(24_23_22_/_16%),0_5px_16px_rgb(24_23_22_/_9%)] ring-1 ring-black/20 sm:w-[min(60vw,270px)] sm:rounded-[2.9rem] sm:p-1.5 lg:w-[250px]">
      <span className="absolute -left-[3px] top-[21%] h-9 w-[3px] rounded-l-full bg-[#1d1d1d]" aria-hidden="true" />
      <span className="absolute -left-[3px] top-[32%] h-12 w-[3px] rounded-l-full bg-[#1d1d1d]" aria-hidden="true" />
      <span className="absolute -right-[3px] top-[31%] h-14 w-[3px] rounded-r-full bg-[#1d1d1d]" aria-hidden="true" />
      <div className="absolute inset-[3px] rounded-[2.5rem] border border-white/10 sm:rounded-[2.75rem]" aria-hidden="true" />
      <div className="relative h-full overflow-hidden rounded-[2.35rem] bg-card ring-1 ring-black/30 sm:rounded-[2.55rem]">
        <Image
          src={image}
          alt={alt}
          fill
          preload={preload}
          sizes="(max-width: 639px) 72vw, (max-width: 1023px) 270px, 250px"
          className={`object-cover ${imageClassName ?? ''}`}
        />
      </div>
    </div>
  )
}

export function BrowserMockup({ alt, image, imageClassName, preload }: MockupProps) {
  return (
    <div className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-[1.15rem] bg-card shadow-[0_22px_60px_rgb(24_23_22_/_12%),0_4px_16px_rgb(24_23_22_/_7%)] ring-1 ring-black/10">
      <div className="flex h-8 items-center gap-1.5 border-b border-border/80 bg-[#f3f2f1] px-3 sm:h-9 sm:px-4">
        <span className="size-2 rounded-full bg-[#d8d4d0] sm:size-2.5" aria-hidden="true" />
        <span className="size-2 rounded-full bg-[#d8d4d0] sm:size-2.5" aria-hidden="true" />
        <span className="size-2 rounded-full bg-[#d8d4d0] sm:size-2.5" aria-hidden="true" />
        <span className="ml-2 h-3.5 w-2/5 rounded-full bg-white/85 ring-1 ring-black/[0.04] sm:h-4" aria-hidden="true" />
      </div>
      <div className="relative aspect-[16/10] bg-[#162332]">
        <Image
          src={image}
          alt={alt}
          fill
          preload={preload}
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 640px, 720px"
          className={`object-contain ${imageClassName ?? ''}`}
        />
      </div>
    </div>
  )
}

export function LaptopMockup({ alt, image, imageClassName, preload }: MockupProps) {
  return (
    <div className="relative z-10 w-full max-w-[760px] pb-[5.5%]">
      <div className="relative overflow-hidden rounded-[0.75rem] border-[5px] border-[#222222] bg-[#111111] shadow-[0_24px_64px_rgb(24_23_22_/_16%),0_5px_18px_rgb(24_23_22_/_8%)] sm:rounded-[1rem] sm:border-[7px]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[0.35rem] bg-card sm:rounded-[0.55rem]">
          <Image
            src={image}
            alt={alt}
            fill
            preload={preload}
            sizes="(max-width: 767px) 90vw, (max-width: 1023px) 640px, 760px"
            className={`object-contain ${imageClassName ?? ''}`}
          />
        </div>
      </div>
      <div className="absolute bottom-[2.5%] left-1/2 h-[4.5%] w-[108%] -translate-x-1/2 rounded-b-[45%] rounded-t-sm bg-gradient-to-b from-[#dedddc] to-[#aaa9a7] shadow-[0_8px_15px_rgb(24_23_22_/_12%)]" aria-hidden="true" />
      <div className="absolute bottom-[4.5%] left-1/2 h-[1.2%] w-[14%] -translate-x-1/2 rounded-b-full bg-[#9c9b99]" aria-hidden="true" />
    </div>
  )
}

export function ProjectVisual({
  compactMobile = false,
  priority: preload = false,
  showcase,
}: {
  compactMobile?: boolean
  priority?: boolean
  showcase: ProjectShowcase
}) {
  const isPhone = showcase.device === 'phone'
  const wrapperClassName = compactMobile
    ? isPhone
      ? 'relative isolate flex h-[400px] items-start justify-center overflow-hidden px-2 pt-3 sm:h-[460px] sm:pt-5 lg:h-[520px] lg:items-center lg:overflow-visible lg:px-8 lg:py-0'
      : 'relative isolate flex min-h-[250px] items-center justify-center px-1 py-5 sm:min-h-[350px] sm:px-6 lg:min-h-[470px] lg:px-8 lg:py-6'
    : 'relative isolate flex min-h-[430px] items-center justify-center overflow-visible px-3 py-8 lg:min-h-[520px] lg:px-8'

  return (
    <div className={wrapperClassName}>
      <div className="absolute left-1/2 top-1/2 -z-10 h-[70%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/[0.09] blur-3xl" />
      <div className="absolute left-[60%] top-[45%] -z-10 h-[52%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/[0.09] blur-3xl" />
      <div className="absolute bottom-[12%] left-1/2 -z-10 h-8 w-3/5 -translate-x-1/2 rounded-full bg-foreground/[0.07] blur-2xl" />

      {showcase.device === 'desktop' ? (
        <LaptopMockup
          alt={showcase.alt}
          image={showcase.src}
          imageClassName={showcase.imageClassName}
          preload={preload}
        />
      ) : showcase.device === 'browser' ? (
        <BrowserMockup
          alt={showcase.alt}
          image={showcase.src}
          imageClassName={showcase.imageClassName}
          preload={preload}
        />
      ) : (
        <PhoneMockup
          alt={showcase.alt}
          image={showcase.src}
          imageClassName={showcase.imageClassName}
          preload={preload}
        />
      )}
    </div>
  )
}
