import Image from 'next/image'

export type ShowcaseVariant = 'mobile' | 'desktop' | 'square'

export type ProjectShowcase = {
  alt: string
  imageClassName?: string
  src: string
  variant?: ShowcaseVariant
}

const imageClassByVariant: Record<ShowcaseVariant, string> = {
  desktop: 'object-contain',
  mobile: 'object-contain',
  square: 'object-contain',
}

function MobileVisual({
  priority,
  showcase,
}: {
  priority?: boolean
  showcase: ProjectShowcase
}) {
  return (
    <div className="relative z-10 aspect-[9/19.5] h-[min(62vh,540px)] min-h-[360px] max-h-[540px] rotate-[-2deg] rounded-[2.4rem] bg-[#171513] p-1.5 shadow-[0_22px_70px_rgb(24_23_22_/_16%),0_5px_18px_rgb(24_23_22_/_10%)] ring-1 ring-foreground/10 sm:p-2">
      <div className="absolute left-1/2 top-2 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/18" />
      <div className="relative h-full overflow-hidden rounded-[2rem] bg-[#0d0d0d]">
        <Image
          src={showcase.src}
          alt={showcase.alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 78vw, 360px"
          className={`${imageClassByVariant.mobile} ${showcase.imageClassName ?? ''}`}
        />
      </div>
    </div>
  )
}

function DesktopVisual({
  priority,
  showcase,
}: {
  priority?: boolean
  showcase: ProjectShowcase
}) {
  return (
    <div className="relative z-10 w-full max-w-[760px] rotate-[1deg] overflow-hidden rounded-[1.15rem] bg-card shadow-[0_24px_80px_rgb(24_23_22_/_12%),0_4px_18px_rgb(24_23_22_/_8%)] ring-1 ring-border">
      <div className="flex h-8 items-center gap-1.5 border-b border-border bg-secondary/80 px-3">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
      </div>
      <div className="relative aspect-[16/10] bg-card">
        <Image
          src={showcase.src}
          alt={showcase.alt}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 86vw, 720px"
          className={`${imageClassByVariant.desktop} ${showcase.imageClassName ?? ''}`}
        />
      </div>
    </div>
  )
}

function SquareVisual({
  priority,
  showcase,
}: {
  priority?: boolean
  showcase: ProjectShowcase
}) {
  return (
    <div className="relative z-10 aspect-[1/1.04] w-full max-w-[500px] rotate-[-1deg] overflow-hidden rounded-[1.6rem] bg-[#162332] shadow-[0_24px_80px_rgb(24_23_22_/_14%),0_4px_18px_rgb(24_23_22_/_8%)] ring-1 ring-foreground/10">
      <Image
        src={showcase.src}
        alt={showcase.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 82vw, 500px"
        className={`${imageClassByVariant.square} ${showcase.imageClassName ?? ''}`}
      />
    </div>
  )
}

export function ProjectVisual({
  compactMobile = false,
  priority = false,
  showcase,
}: {
  compactMobile?: boolean
  priority?: boolean
  showcase: ProjectShowcase
}) {
  const variant = showcase.variant ?? 'mobile'
  const wrapperClassName = compactMobile
    ? 'relative isolate flex min-h-[350px] items-start justify-center overflow-visible px-1 py-3 sm:min-h-[430px] sm:items-center sm:px-3 sm:py-8 lg:min-h-[520px] lg:items-start lg:px-8 lg:py-2'
    : 'relative isolate flex min-h-[430px] items-center justify-center overflow-visible px-3 py-8 lg:min-h-[520px] lg:items-start lg:px-8 lg:py-2'

  return (
    <div className={wrapperClassName}>
      <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/18 blur-3xl" />
      <div className="absolute left-[58%] top-[48%] -z-10 h-56 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/16 blur-3xl" />
      <div className="absolute bottom-[10%] left-1/2 -z-10 h-10 w-72 -translate-x-1/2 rounded-full bg-foreground/10 blur-2xl" />

      {variant === 'desktop' ? (
        <DesktopVisual priority={priority} showcase={showcase} />
      ) : variant === 'square' ? (
        <SquareVisual priority={priority} showcase={showcase} />
      ) : (
        <MobileVisual priority={priority} showcase={showcase} />
      )}
    </div>
  )
}
