export function CalendarPreview() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const booked = new Set([9, 14, 15, 22])
  return (
    <div className="flex h-full w-full flex-col p-2">
      <div className="mb-1 flex items-center justify-between px-0.5 text-[8px] font-medium text-muted-foreground">
        <span>Apríl 2024</span>
        <div className="flex gap-1">
          <span aria-hidden="true">&#8249;</span>
          <span aria-hidden="true">&#8250;</span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-7 gap-[2px]">
        {days.map((d) => (
          <div
            key={d}
            className={`flex items-center justify-center rounded-[3px] text-[7px] ${
              booked.has(d)
                ? 'bg-brand font-semibold text-brand-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  )
}

export function FlowPreview() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2 p-3">
      {[
        { label: 'Doklad', tone: 'bg-secondary text-muted-foreground' },
        { label: 'Spracovanie', tone: 'bg-brand-soft text-brand' },
        { label: 'Faktúra', tone: 'bg-emerald-50 text-emerald-600' },
      ].map((node, i) => (
        <div key={node.label} className="flex flex-col items-start gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[8px] font-medium ${node.tone}`}
          >
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {node.label}
          </div>
          {i < 2 && <span className="ml-2 h-2 w-px bg-border" aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}
