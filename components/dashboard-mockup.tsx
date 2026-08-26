import Image from 'next/image'
import {
  BarChart3,
  Bell,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  FileText,
  LayoutDashboard,
  Mic,
  PenLine,
  Settings2,
  Sparkles,
} from 'lucide-react'

const navigation = [
  { icon: LayoutDashboard, label: 'Prehľad', active: true },
  { icon: PenLine, label: 'Vytvoriť príspevok', action: true },
  { icon: CalendarDays, label: 'Kalendár' },
  { icon: FileText, label: 'Príspevky' },
  { icon: BarChart3, label: 'Výsledky' },
  { icon: Settings2, label: 'Nastavenia' },
]

function PostlyMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[22px] shrink-0"
      role="img"
      aria-label="Postly"
    >
      <rect width="24" height="24" rx="7" fill="#635BFF" />
      <path
        d="M7.25 17V7.25h5.5a3.25 3.25 0 0 1 0 6.5h-3"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <circle cx="16.85" cy="6.95" r="1.15" fill="#C8C5FF" />
    </svg>
  )
}

export function DashboardMockup() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#f8f8fb] font-sans text-[9px] leading-[1.25] text-[#202028] sm:text-[10px]">
      <aside className="hidden w-[126px] shrink-0 flex-col bg-white px-3 py-3 xl:w-[142px] xl:px-3.5 xl:py-4 sm:flex">
        <div className="flex items-center gap-2.5 px-1">
          <PostlyMark />
          <span className="min-w-0">
            <strong className="block text-[12px] font-semibold tracking-[-0.03em] text-[#202028]">
              Postly
            </strong>
            <span className="mt-0.5 block whitespace-nowrap text-[6px] text-[#9595a1]">
              Váš obsah. Jednoduchšie.
            </span>
          </span>
        </div>

        <nav className="mt-4 flex flex-col gap-0.5 xl:mt-6 xl:gap-1" aria-label="Navigácia aplikácie Postly">
          {navigation.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-[7px] px-2 py-[7px] transition-colors ${
                item.active
                  ? 'bg-[#f0efff] font-semibold text-[#554de0]'
                  : 'text-[#747480]'
              } ${item.action ? 'dashboard-action-target' : ''}`}
            >
              <item.icon className="size-3.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
              <span className="whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-auto px-1">
          <p className="text-[6px] uppercase tracking-[0.12em] text-[#aaaab3]">Pracovný priestor</p>
          <p className="mt-1 text-[7px] font-medium text-[#656570]">Milan · záhradné realizácie</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden px-3 py-3 xl:px-5 xl:py-4">
        <header className="mb-2.5 flex items-start justify-between xl:mb-4">
          <div>
            <h2 className="text-[15px] font-semibold leading-none tracking-[-0.03em]">Prehľad</h2>
            <p className="mt-1.5 text-[7px] text-[#868691]">
              Pripravte a naplánujte obsah pre svoje sociálne siete.
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-[#72727e]">
            <Bell className="size-3.5" strokeWidth={1.7} aria-label="Notifikácie" />
            <span className="grid size-6 place-items-center rounded-full bg-[#ececf2] text-[8px] font-semibold text-[#555561]">
              MP
            </span>
            <span className="hidden text-[8px] font-medium xl:inline">Milan</span>
          </div>
        </header>

        <section
          className="grid grid-cols-[1.35fr_1fr] overflow-hidden rounded-[13px] bg-white shadow-[0_1px_2px_rgb(30_30_45_/_4%),0_8px_24px_rgb(30_30_45_/_5%)]"
          aria-label="Tvorba nového príspevku"
        >
          <div className="min-w-0 p-2.5 xl:p-3.5">
            <div className="mb-2 flex items-end justify-between gap-3 xl:mb-2.5">
              <div>
                <h3 className="text-[10px] font-semibold tracking-[-0.01em]">
                  Vytvoriť nový príspevok
                </h3>
                <p className="mt-1 text-[7px] text-[#8b8b96]">
                  Pridajte fotografiu práce a povedzte, čo ste urobili.
                </p>
              </div>
              <span className="shrink-0 text-[6px] text-[#a0a0aa]">Približne 1 min</span>
            </div>

            <div className="grid grid-cols-[76px_1fr] gap-2.5 xl:grid-cols-[84px_1fr] xl:gap-3">
              <div>
                <div className="relative h-[76px] overflow-hidden rounded-[9px] bg-[#ededf1] xl:h-[84px]">
                  <Image
                    src="/socially-rock-garden.png"
                    alt="Dokončená okrasná skalka v záhrade"
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-1.5 text-[6px] text-[#9898a2]">Fotografia realizácie · Upraviť</p>
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="relative flex-1 pb-1.5">
                  <p className="pr-4 text-[7px] font-medium text-[#7c7c87]">Čo chcete dnes zdieľať?</p>
                  <p className="mt-2 line-clamp-4 text-[8px] leading-[1.45] text-[#36363e]">
                    Dnes sme dokončili okrasnú skalku pri rodinnom dome. Použili sme
                    prírodný kameň, okrasné trávy a nízke dreviny. Realizácia trvala dva dni.
                  </p>
                  <Mic
                    className="absolute right-0 top-0 size-3 text-[#7772c8]"
                    strokeWidth={1.7}
                    aria-label="Možnosť diktovania"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="h-6 rounded-[7px] bg-[#272733] px-3 text-[7px] font-semibold text-white shadow-sm"
                  >
                    Pripraviť príspevok
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 bg-[#f4f3ff] p-2.5 xl:p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="grid size-4 place-items-center rounded-full bg-[#635bff] text-white">
                  <Check className="size-2.5" strokeWidth={2.2} aria-hidden="true" />
                </span>
                <h3 className="text-[10px] font-semibold">Pripravený návrh</h3>
              </div>
              <span className="text-[6px] text-[#9693b2]">Uložené</span>
            </div>

            <div className="mt-2 text-[7px] leading-[1.4] text-[#464550] xl:mt-2.5 xl:leading-[1.45]">
              <p className="font-semibold text-[#282731]">Nová skalka je hotová 🌿</p>
              <p className="mt-1.5 line-clamp-4 xl:line-clamp-none">
                Dnes sme dokončili okrasnú skalku pri rodinnom dome. Prírodný kameň sme
                doplnili okrasnými trávami a nízkymi drevinami. Realizácia trvala dva dni.
              </p>
            </div>

            <p className="mt-2 text-[6px] text-[#7b7890]">
              Instagram&nbsp;&nbsp;·&nbsp;&nbsp;Facebook
            </p>

            <div className="mt-2 flex items-end justify-between gap-2 xl:mt-2.5">
              <div className="text-[6px] leading-relaxed text-[#77748a]">
                <p className="flex items-center gap-1 font-medium text-[#454252]">
                  <Clock3 className="size-2.5 text-[#635bff]" aria-hidden="true" />
                  Odporúčaný čas: Dnes, 18:30
                </p>
                <p>
                  Odhadovaný potenciál:{' '}
                  <span className="font-medium text-[#5a52e5]">Vysoký</span>
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-[7px] bg-[#635bff] px-2.5 py-1.5 text-[6px] font-semibold text-white shadow-sm"
              >
                Naplánovať
              </button>
            </div>
          </div>
        </section>

        <section
          className="mt-2.5 grid grid-cols-[1.02fr_1.18fr_0.92fr] gap-3 xl:mt-4 xl:gap-4"
          aria-label="Prehľad obsahu a výsledkov"
        >
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">Naplánované</h3>
              <span className="text-[6px] text-[#706bc0]">Zobraziť kalendár</span>
            </div>
            <div className="mt-1.5 space-y-1.5 xl:mt-2.5 xl:space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="relative size-7 shrink-0 overflow-hidden rounded-[6px] bg-[#e8e8ed]">
                  <Image
                    src="/socially-rock-garden.png"
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[7px] font-medium">Dnes · 18:30</p>
                  <p className="mt-0.5 truncate text-[6px] text-[#898993]">Instagram + Facebook</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-[6px] bg-[#ededf2]">
                  <Camera className="size-3.5 text-[#777782]" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[7px] font-medium">Štvrtok · 10:15</p>
                  <p className="mt-0.5 truncate text-[6px] text-[#898993]">Údržba živého plota</p>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Dosah za 30 dní</h3>
                <p className="mt-1 text-[6px] text-[#898993]">Čo funguje najlepšie</p>
              </div>
              <span className="text-[8px] font-semibold text-[#5a52e5]">+24 %</span>
            </div>
            <svg
              viewBox="0 0 160 35"
              className="mt-1.5 h-[30px] w-full"
              role="img"
              aria-label="Rastúci dosah príspevkov za posledných 30 dní"
            >
              <defs>
                <linearGradient id="postly-reach" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#635BFF" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#635BFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 31 C14 30 19 23 31 25 C45 27 49 12 63 17 C77 22 83 12 96 14 C110 16 118 4 130 8 C141 11 150 4 160 2 L160 35 L0 35 Z"
                fill="url(#postly-reach)"
              />
              <path
                d="M0 31 C14 30 19 23 31 25 C45 27 49 12 63 17 C77 22 83 12 96 14 C110 16 118 4 130 8 C141 11 150 4 160 2"
                fill="none"
                stroke="#635BFF"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
            <p className="mt-1 text-[6px] leading-[1.4] text-[#7e7e88]">
              Fotografie hotových realizácií majú o{' '}
              <strong className="font-semibold text-[#404049]">31 % vyšší dosah</strong>.
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[#635bff]">
              <Sparkles className="size-3" strokeWidth={1.7} aria-hidden="true" />
              <h3 className="font-semibold text-[#373740]">Učíme sa váš štýl</h3>
            </div>
            <p className="mt-1.5 text-[7px] font-semibold text-[#373740] xl:mt-2.5">Váš obsah zostáva váš.</p>
            <p className="mt-1 text-[6px] leading-[1.5] text-[#7e7e88] xl:mt-1.5">
              Používame iba informácie, ktoré zadáte, a učíme sa, čo zaujíma vašich zákazníkov.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
