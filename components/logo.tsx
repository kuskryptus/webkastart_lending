import Link from 'next/link'

type LogoMarkProps = {
  className?: string
  size?: 'default' | 'compact'
}

const markSizes = {
  default: {
    frame: 'size-9 rounded-xl',
  },
  compact: {
    frame: 'size-6 rounded-lg',
  },
}

export function LogoMark({ className = '', size = 'default' }: LogoMarkProps) {
  const sizes = markSizes[size]

  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden border border-border/70 bg-white text-foreground shadow-card ${sizes.frame} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 180 180" className="size-full" fill="none">
        <path
          d="M42 54H61.2L75.6 107.7L90.7 54H106.9L122.1 107.7L136.5 54H155L132.1 126H113.4L98.5 75.9L83.5 126H64.8L42 54Z"
          fill="currentColor"
        />
        <circle cx="145" cy="119" r="10" className="fill-brand" />
      </svg>
    </span>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="#"
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="WebkaStart — domovská stránka"
    >
      <LogoMark />
      <span className="text-[17px] font-semibold text-foreground">
        Webka<span className="text-muted-foreground">Start</span>
      </span>
    </Link>
  )
}
