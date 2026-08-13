import {
  LayoutGrid,
  FileText,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react'

const stats = [
  { label: 'Príjmy (tento mesiac)', value: '24 540 €', delta: '+12,5 %' },
  { label: 'Objednávky', value: '1 243', delta: '+8,2 %' },
  { label: 'Konverzia', value: '3,62 %', delta: '+4,1 %' },
]

const orders = [
  { id: '#1256', name: 'Ján Novák', amount: '320,00 €', status: 'Zaplatená' },
  { id: '#1255', name: 'Firma s.r.o.', amount: '1 250,00 €', status: 'Zaplatená' },
  { id: '#1254', name: 'Peter Kováč', amount: '88,00 €', status: 'Čaká na platbu' },
]

const sidebar = [
  { icon: LayoutGrid, label: 'Prehľad', active: true },
  { icon: FileText, label: 'Faktúry' },
  { icon: ShoppingCart, label: 'Objednávky' },
  { icon: Users, label: 'Zákazníci' },
  { icon: BarChart3, label: 'Štatistiky' },
  { icon: Settings, label: 'Nastavenia' },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']

export function DashboardMockup() {
  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl bg-card text-[10px] leading-tight sm:text-[11px]">
      {/* Sidebar */}
      <aside className="hidden w-36 shrink-0 flex-col gap-1 border-r border-border/70 bg-secondary/60 p-3 sm:flex">
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
          <span className="font-semibold">WebkaStart</span>
        </div>
        {sidebar.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
              item.active
                ? 'bg-card font-medium text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon className="size-3.5" aria-hidden="true" />
            <span>{item.label}</span>
          </div>
        ))}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold">Prehľad</span>
          <div className="flex gap-1.5">
            <span className="size-5 rounded-md bg-secondary" aria-hidden="true" />
            <span className="size-5 rounded-md bg-secondary" aria-hidden="true" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border/70 p-2.5">
              <p className="truncate text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-[13px] font-semibold">{s.value}</p>
              <p className="mt-0.5 font-medium text-brand">{s.delta}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-3 rounded-lg border border-border/70 p-3">
          <p className="mb-2 font-medium">Vývoj tržieb</p>
          <div className="flex gap-2">
            <div className="flex flex-col justify-between py-0.5 text-[8px] text-muted-foreground">
              <span>500</span>
              <span>250</span>
              <span>0</span>
            </div>
            <svg
              viewBox="0 0 300 90"
              className="h-20 w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label="Graf vývoja tržieb za posledný rok"
            >
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 70 L27 60 L54 66 L82 48 L109 54 L136 38 L163 44 L190 30 L218 40 L245 26 L272 34 L300 18"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0 70 L27 60 L54 66 L82 48 L109 54 L136 38 L163 44 L190 30 L218 40 L245 26 L272 34 L300 18 L300 90 L0 90 Z"
                fill="url(#area)"
                stroke="none"
              />
            </svg>
          </div>
          <div className="mt-1.5 flex justify-between pl-6 text-[8px] text-muted-foreground">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="mt-3">
          <p className="mb-2 font-medium">Najnovšie objednávky</p>
          <div className="flex flex-col gap-1.5">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-2 rounded-lg border border-border/70 px-2.5 py-2"
              >
                <span className="size-5 shrink-0 rounded-md bg-brand-soft" aria-hidden="true" />
                <span className="w-24 shrink-0 font-medium">Objednávka {o.id}</span>
                <span className="hidden flex-1 truncate text-muted-foreground sm:inline">
                  {o.name}
                </span>
                <span className="ml-auto shrink-0 font-medium">{o.amount}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-medium ${
                    o.status === 'Zaplatená'
                      ? 'bg-brand-soft text-brand'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
