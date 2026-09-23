import { Check, Cloud } from 'lucide-react'

const sourceMaterials = [
  {
    title: 'Logo',
    description: 'Ideálne SVG, PDF alebo PNG s transparentným pozadím.',
  },
  {
    title: 'Fotografie produktov alebo služieb',
    description: 'Nahrajte originály v čo najvyššej kvalite, pokojne aj viac záberov.',
  },
  {
    title: 'Fotografie prevádzky',
    description: 'Exteriér, interiér, prípadne terasa alebo iné dôležité priestory.',
  },
  {
    title: 'Tím alebo personál',
    description: 'Portréty či spoločné fotografie, ak sú pre vaše podnikanie relevantné.',
  },
  {
    title: 'Videá',
    description: 'Videá, ktoré chcete použiť na webe.',
  },
  {
    title: 'Cenník, menu alebo katalóg',
    description: 'PDF, obrázok alebo iný formát, ktorý máte k dispozícii.',
  },
  {
    title: 'Brand materiály',
    description: 'Farby, fonty, brand manuál a ďalšie pravidlá značky, ak ich máte.',
  },
  {
    title: 'Ostatné dôležité podklady',
    description: 'Čokoľvek ďalšie, čo chcete na webe ukázať alebo použiť.',
  },
] as const

const campaignMaterials = [
  { title: 'Logo a pravidlá značky', description: 'Logo, farby, fonty alebo brand manuál, ak ich máte.' },
  { title: 'Fotografie', description: 'Originálne fotografie produktu, služby, prevádzky alebo tímu.' },
  { title: 'Videá', description: 'Aj nespracované videá z telefónu môžu byť užitočným podkladom.' },
  { title: 'Texty a ponuka', description: 'Cenník, popis služby, akcia alebo dokument s dôležitými informáciami.' },
  { title: 'Referencie', description: 'Recenzie, výsledky alebo skúsenosti zákazníkov, ktoré môžeme komunikovať.' },
  { title: 'Výsledky starších kampaní', description: 'Reporty alebo screenshoty, ak ste už reklamu spúšťali.' },
] as const

export function AutoSaveNotice() {
  return (
    <div className="flex items-start gap-3 border-y border-brand/15 bg-brand-soft/45 px-4 py-4 sm:px-5">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white text-brand">
        <Cloud className="size-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">Nemusíte nič ukladať ručne</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Odpovede sa priebežne ukladajú automaticky. Každý úspešne nahraný súbor tu zostane aj po zatvorení formulára a po návrate cez tento odkaz.
        </p>
      </div>
    </div>
  )
}

export function SourceMaterialsChecklist() {
  return (
    <section aria-labelledby="source-materials-title" className="border-y border-border/70 py-7">
      <h3 id="source-materials-title" className="text-lg font-semibold tracking-[-0.025em]">Skontrolujte, či ste pridali všetky dôležité podklady</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Nemusíte mať všetko. Prejdite si však tento zoznam, aby ste nezabudli na materiály, ktoré najlepšie predstavia vaše podnikanie.
      </p>
      <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {sourceMaterials.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <Check className="size-3.5" aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-sm font-semibold text-foreground">{item.title}</strong>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">
        Ak niektorý podklad nemáte alebo sa vás netýka, pokojne ho vynechajte. Ďalšie súbory môžete doplniť aj neskôr.
      </p>
    </section>
  )
}

export function CampaignMaterialsChecklist() {
  return (
    <section aria-labelledby="campaign-materials-title" className="border-y border-border/70 py-7">
      <h3 id="campaign-materials-title" className="text-lg font-semibold tracking-[-0.025em]">Nahrajte podklady, ktoré už máte</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Nemusíte mať všetko pripravené. Podklady pomôžu určiť, čo sa dá použiť a čo bude potrebné pre kampaň vytvoriť.</p>
      <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {campaignMaterials.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Check className="size-3.5" aria-hidden="true" /></span>
            <span><strong className="block text-sm font-semibold text-foreground">{item.title}</strong><span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span></span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">Chýbajúce materiály pokojne vynechajte. Vo formulári označte, s čím potrebujete pomôcť.</p>
    </section>
  )
}
