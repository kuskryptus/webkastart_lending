import type { ReactNode } from 'react'

export function LaptopFrame({
  children,
  className = '',
  screenClassName = '',
}: {
  children: ReactNode
  className?: string
  screenClassName?: string
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="rounded-[14px] border border-border bg-primary p-2 shadow-card-hover">
        <div
          className={`relative aspect-[16/11] w-full overflow-hidden rounded-lg bg-card ${screenClassName}`}
        >
          {children}
        </div>
      </div>
      <div
        className="mx-auto h-2.5 w-[calc(100%+2rem)] -translate-x-4 rounded-b-xl bg-primary/85"
        aria-hidden="true"
      />
    </div>
  )
}
