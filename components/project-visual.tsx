import Image from 'next/image'
import { ExpenseTrackerDemo } from '@/components/expense-tracker-demo'

export type ProjectDevice = 'phone' | 'browser' | 'desktop'

export type ProjectShowcase = {
  alt: string
  device: ProjectDevice
  imageClassName?: string
  interactive?: 'expenses'
  phoneTone?: 'light' | 'dark'
  src: string
}

type MockupProps = {
  alt: string
  compactMobile?: boolean
  detail?: boolean
  image: string
  imageClassName?: string
  interactive?: 'expenses'
  preload?: boolean
  tone?: 'light' | 'dark'
}

export function PhoneMockup({
  alt,
  compactMobile = false,
  detail = false,
  image,
  imageClassName,
  interactive,
  preload,
  tone = 'light',
}: MockupProps) {
  const widthClassName = interactive
    ? 'w-[min(72vw,250px)] sm:w-[240px] lg:w-[250px]'
    : detail
    ? 'w-[min(76vw,32dvh,340px)]'
    : compactMobile
      ? 'w-[min(49vw,190px)] min-[430px]:w-[200px] sm:w-[225px] lg:w-[250px]'
      : 'w-[min(60vw,230px)] min-[430px]:w-[min(56vw,245px)] sm:w-[240px] lg:w-[250px]'

  return (
    <div data-device-mockup="phone" className={`relative z-10 aspect-[9/19.5] rounded-[2.45rem] bg-[#0b0b0b] p-1 shadow-[0_22px_56px_rgb(24_23_22_/_15%),0_4px_14px_rgb(24_23_22_/_8%)] ring-1 ring-black/20 sm:rounded-[2.7rem] sm:p-[5px] ${widthClassName}`}>
      <span className="absolute -left-[3px] top-[21%] h-9 w-[3px] rounded-l-full bg-[#1d1d1d]" aria-hidden="true" />
      <span className="absolute -left-[3px] top-[32%] h-12 w-[3px] rounded-l-full bg-[#1d1d1d]" aria-hidden="true" />
      <span className="absolute -right-[3px] top-[31%] h-14 w-[3px] rounded-r-full bg-[#1d1d1d]" aria-hidden="true" />
      <div className="absolute inset-[3px] rounded-[2.3rem] border border-white/10 sm:rounded-[2.55rem]" aria-hidden="true" />
      <div className={`relative h-full overflow-hidden rounded-[2.18rem] ring-1 ring-black/30 sm:rounded-[2.4rem] ${tone === 'dark' ? 'bg-[#080808]' : 'bg-white'}`}>
        {interactive === 'expenses' ? (
          <ExpenseTrackerDemo />
        ) : (
          <Image
            src={image}
            alt={alt}
            fill
            preload={preload}
            sizes={detail
              ? '(max-width: 639px) 76vw, 340px'
              : compactMobile
                ? '(max-width: 429px) 49vw, (max-width: 639px) 200px, (max-width: 1023px) 225px, 250px'
                : '(max-width: 429px) 60vw, (max-width: 639px) 56vw, (max-width: 1023px) 240px, 250px'}
            className={`object-contain ${imageClassName ?? ''}`}
          />
        )}
        {tone === 'dark' && (
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex h-[4.25%] items-center justify-center bg-[#080808]"
            aria-hidden="true"
          >
            <span className="h-[3px] w-[24%] rounded-full bg-white/55" />
          </div>
        )}
      </div>
    </div>
  )
}

export function BrowserMockup({ alt, detail = false, image, imageClassName, preload }: MockupProps) {
  return (
    <div data-device-mockup="browser" className={`relative z-10 w-full overflow-hidden rounded-[1.15rem] bg-card shadow-[0_22px_60px_rgb(24_23_22_/_12%),0_4px_16px_rgb(24_23_22_/_7%)] ring-1 ring-black/10 ${detail ? 'max-w-[1080px]' : 'max-w-[390px] sm:max-w-[560px] lg:max-w-[720px]'}`}>
      <div className="flex h-8 items-center gap-1.5 border-b border-border/80 bg-[#f3f2f1] px-3 sm:h-9 sm:px-4">
        <span className="size-2 rounded-full bg-[#d8d4d0] sm:size-2.5" aria-hidden="true" />
        <span className="size-2 rounded-full bg-[#d8d4d0] sm:size-2.5" aria-hidden="true" />
        <span className="size-2 rounded-full bg-[#d8d4d0] sm:size-2.5" aria-hidden="true" />
        <span className="ml-2 h-3.5 w-2/5 rounded-full bg-white/85 ring-1 ring-black/[0.04] sm:h-4" aria-hidden="true" />
      </div>
      <div className="relative aspect-[4/3] bg-[#162332]">
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

export function LaptopMockup({ alt, detail = false, image, imageClassName, preload }: MockupProps) {
  return (
    <div data-device-mockup="desktop" className={`relative z-10 w-full pb-[5.5%] ${detail ? 'max-w-[1100px]' : 'max-w-[390px] sm:max-w-[620px] lg:max-w-[760px]'}`}>
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
  detail = false,
  priority: preload = false,
  showcase,
}: {
  compactMobile?: boolean
  detail?: boolean
  priority?: boolean
  showcase: ProjectShowcase
}) {
  const isPhone = showcase.device === 'phone'
  const wrapperClassName = detail
    ? 'relative isolate flex h-full w-full items-center justify-center overflow-visible px-1 py-2 sm:px-4 sm:py-3'
    : compactMobile
      ? isPhone
        ? 'relative isolate flex items-center justify-center px-2 py-1 sm:px-4 sm:py-3 lg:px-8 lg:py-0'
        : 'relative isolate flex items-center justify-center px-0 py-2 sm:px-5 sm:py-4 lg:px-6 lg:py-2'
      : 'relative isolate flex min-h-[430px] items-center justify-center overflow-visible px-3 py-8 lg:min-h-[520px] lg:px-8'

  return (
    <div className={wrapperClassName}>
      <div className="absolute left-1/2 top-1/2 -z-10 h-[72%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/[0.07] blur-3xl" />
      <div className="absolute bottom-[7%] left-1/2 -z-10 h-7 w-3/5 -translate-x-1/2 rounded-full bg-foreground/[0.06] blur-2xl" />

      {showcase.device === 'desktop' ? (
        <LaptopMockup
          alt={showcase.alt}
          detail={detail}
          image={showcase.src}
          imageClassName={showcase.imageClassName}
          preload={preload}
        />
      ) : showcase.device === 'browser' ? (
        <BrowserMockup
          alt={showcase.alt}
          detail={detail}
          image={showcase.src}
          imageClassName={showcase.imageClassName}
          preload={preload}
        />
      ) : (
        <PhoneMockup
          alt={showcase.alt}
          compactMobile={compactMobile}
          detail={detail}
          image={showcase.src}
          imageClassName={showcase.imageClassName}
          interactive={showcase.interactive}
          preload={preload}
          tone={showcase.phoneTone}
        />
      )}
    </div>
  )
}
