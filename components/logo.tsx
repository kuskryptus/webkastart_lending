import Link from 'next/link'

type LogoMarkProps = {
  className?: string
  size?: 'default' | 'compact'
}

const markSizes = {
  default: {
    frame: 'h-8 w-[52px]',
  },
  compact: {
    frame: 'h-5 w-[32px]',
  },
}

export function LogoMark({ className = '', size = 'default' }: LogoMarkProps) {
  const sizes = markSizes[size]

  return (
    <span
      className={`inline-flex shrink-0 items-center text-foreground ${sizes.frame} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 220 140" className="h-full w-full" fill="none">
        <path
          d="M32 32L72 108L110 32L148 108L188 32"
          stroke="currentColor"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="204" cy="104" r="13" className="fill-brand" />
      </svg>
    </span>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="#"
      className={`inline-flex items-center ${className}`}
      aria-label="WebkaStart — domovská stránka"
    >
      <LogoMark />
    </Link>
  )
}
