import Image from 'next/image'
import { ExpenseTrackerDemo } from '@/components/expense-tracker-demo'
import { LaptopFrame } from '@/components/laptop-frame'

export type ProjectDevice = 'phone' | 'phone-image' | 'phone-screen' | 'browser' | 'chat' | 'desktop' | 'image'

export type ProjectShowcase = {
  alt: string
  device: ProjectDevice
  imageAspectRatio?: number
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
  imageAspectRatio?: number
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
    ? 'w-[min(80vw,260px)] sm:w-[270px] lg:w-[275px]'
    : detail
    ? 'w-[min(88vw,32dvh,400px)]'
    : compactMobile
      ? 'w-[min(65vw,250px)] sm:w-[275px] lg:w-[295px]'
      : 'w-[min(72vw,275px)] sm:w-[290px] lg:w-[300px]'

  return (
    <div data-device-mockup="phone" className={`relative z-10 aspect-[324/638] ${widthClassName}`}>
      <Image
        src="/portfolio/phone-frame.png"
        alt=""
        fill
        loading="eager"
        sizes="(max-width: 639px) 80vw, (max-width: 1023px) 300px, 400px"
        className="pointer-events-none select-none object-contain"
        style={{ clipPath: 'inset(3.5% 4% 5.5% 6.2% round 17% / 8.6%)' }}
        aria-hidden="true"
      />
      <div className={`absolute left-[10.8%] top-[5.55%] z-10 h-[86.2%] w-[80.5%] overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] ${tone === 'dark' ? 'bg-[#080808]' : 'bg-white'}`}>
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
        {interactive !== 'expenses' && (
          <span
            className={`absolute bottom-[0.85%] left-1/2 z-10 h-[3px] w-[24%] -translate-x-1/2 rounded-full ${
              tone === 'dark' ? 'bg-white/55' : 'bg-[#1d1a18]/45'
            }`}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}

export function PhoneImage({ alt, compactMobile = false, detail = false, image, imageClassName, preload }: MockupProps) {
  const widthClassName = detail
    ? 'w-[min(88vw,32dvh,400px)]'
    : compactMobile
      ? 'w-[min(65vw,250px)] sm:w-[275px] lg:w-[295px]'
      : 'w-[min(72vw,275px)] sm:w-[290px] lg:w-[300px]'

  return (
    <div data-device-mockup="phone-image" className={`relative z-10 aspect-[889/1768] ${widthClassName}`}>
      <Image
        src={image}
        alt={alt}
        fill
        preload={preload}
        sizes={detail
          ? '(max-width: 639px) 88vw, 400px'
          : compactMobile
            ? '(max-width: 639px) 65vw, 295px'
            : '(max-width: 639px) 72vw, 300px'}
        className={`object-contain ${imageClassName ?? ''}`}
      />
    </div>
  )
}

export function PhoneScreen({ alt, compactMobile = false, detail = false, image, preload }: MockupProps) {
  const widthClassName = detail
    ? 'w-[min(88vw,32dvh,400px)]'
    : compactMobile
      ? 'w-[min(65vw,250px)] sm:w-[275px] lg:w-[295px]'
      : 'w-[min(72vw,275px)] sm:w-[290px] lg:w-[300px]'

  return (
    <div
      data-device-mockup="phone-screen"
      className={`relative z-10 rounded-[2.5rem] bg-[linear-gradient(120deg,#78797e,#17181b_18%,#616268_52%,#151619_84%,#85868a)] p-[4px] shadow-[0_22px_50px_rgb(24_23_22_/_16%)] ${widthClassName}`}
    >
      <div className="rounded-[2.3rem] bg-[#090909] p-[3px]">
        <div className="relative aspect-[662/1280] overflow-hidden rounded-[2.1rem] bg-[#090909]">
          <Image
            src={image}
            alt={alt}
            fill
            preload={preload}
            sizes={detail
              ? '(max-width: 639px) 88vw, 400px'
              : compactMobile
                ? '(max-width: 639px) 65vw, 295px'
                : '(max-width: 639px) 72vw, 300px'}
            className="object-fill"
          />
        </div>
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

export function ChatMockup({ alt, detail = false, image, imageClassName, preload }: MockupProps) {
  return (
    <div
      data-device-mockup="chat"
      className={`relative z-10 w-full overflow-hidden rounded-[1.6rem] bg-[#101b27] p-1.5 shadow-[0_24px_64px_rgb(24_23_22_/_16%),0_5px_18px_rgb(24_23_22_/_10%)] ring-1 ring-black/15 sm:p-2 ${
        detail ? 'max-w-[680px]' : 'max-w-[360px] sm:max-w-[460px] lg:max-w-[520px]'
      }`}
    >
      <div className="relative aspect-[5/6] overflow-hidden rounded-[1.25rem] bg-[#172430] ring-1 ring-white/5 sm:rounded-[1.35rem]">
        <Image
          src={image}
          alt={alt}
          fill
          preload={preload}
          sizes={detail
            ? '(max-width: 767px) 90vw, 680px'
            : '(max-width: 639px) 90vw, (max-width: 1023px) 460px, 520px'}
          className={`object-cover object-left-top ${imageClassName ?? ''}`}
        />
      </div>
    </div>
  )
}

export function LaptopMockup({ alt, detail = false, image, imageClassName, preload }: MockupProps) {
  return (
    <div
      data-device-mockup="desktop"
      className={`relative z-10 w-full ${
        detail ? 'max-w-[1120px]' : 'max-w-[420px] sm:max-w-[650px] lg:max-w-[780px]'
      }`}
    >
      <LaptopFrame screenClassName="bg-white">
        <Image
          src={image}
          alt={alt}
          fill
          preload={preload}
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 640px, 760px"
          className={`object-fill ${imageClassName ?? ''}`}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-black/[0.025]"
          aria-hidden="true"
        />
      </LaptopFrame>
    </div>
  )
}

export function ProductImage({ alt, detail = false, image, imageAspectRatio = 1442 / 960, imageClassName, preload }: MockupProps) {
  return (
    <div
      data-device-mockup="image"
      className={`relative z-10 w-full ${detail ? 'max-w-[1200px]' : 'max-w-[460px] sm:max-w-[680px] lg:max-w-[820px]'}`}
      style={{ aspectRatio: imageAspectRatio }}
    >
      <Image
        src={image}
        alt={alt}
        fill
        preload={preload}
        sizes={detail
          ? '(max-width: 1279px) 94vw, 1200px'
          : '(max-width: 639px) 94vw, (max-width: 1023px) 680px, 820px'}
        className={`object-contain ${imageClassName ?? ''}`}
      />
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
  const isPhone = showcase.device === 'phone' || showcase.device === 'phone-image' || showcase.device === 'phone-screen'
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

      {showcase.device === 'phone-screen' ? (
        <PhoneScreen
          alt={showcase.alt}
          compactMobile={compactMobile}
          detail={detail}
          image={showcase.src}
          preload={preload}
        />
      ) : showcase.device === 'phone-image' ? (
        <PhoneImage
          alt={showcase.alt}
          compactMobile={compactMobile}
          detail={detail}
          image={showcase.src}
          imageClassName={showcase.imageClassName}
          preload={preload}
        />
      ) : showcase.device === 'image' ? (
        <ProductImage
          alt={showcase.alt}
          detail={detail}
          image={showcase.src}
          imageAspectRatio={showcase.imageAspectRatio}
          imageClassName={showcase.imageClassName}
          preload={preload}
        />
      ) : showcase.device === 'desktop' ? (
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
      ) : showcase.device === 'chat' ? (
        <ChatMockup
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
