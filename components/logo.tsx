import Link from 'next/link'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="#"
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="WebkaStart — domovská stránka"
    >
      <span className="size-2.5 rounded-full bg-brand" aria-hidden="true" />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        Webka<span className="text-muted-foreground">Start</span>
      </span>
    </Link>
  )
}
