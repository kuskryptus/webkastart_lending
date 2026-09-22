export function TechnologyBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="technology-dot-grid absolute inset-0 opacity-55" />
      <div className="absolute -left-24 top-8 size-72 rounded-full bg-brand/7 blur-3xl sm:size-96" />
      <div className="absolute -right-32 top-24 size-80 rounded-full bg-brand/8 blur-3xl sm:size-[30rem]" />
    </div>
  )
}
