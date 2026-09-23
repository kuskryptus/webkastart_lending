import Image from 'next/image'

export function HeroPaperReveal() {
  return (
    <>
      <div aria-hidden="true" className="hero-digital-reveal absolute inset-0">
        <div className="hero-system-console">
          <div className="hero-system-console-bar">
            <span className="hero-system-lights" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="hero-system-title">workflow.engine</span>
            <span className="hero-system-live">
              <i /> live
            </span>
          </div>

          <div className="hero-system-console-body">
            <div className="hero-system-command">
              <span className="text-violet-300">$</span>
              <span>spustiť workflow</span>
              <i aria-hidden="true" />
            </div>

            <div className="hero-system-steps">
              <div className="hero-system-step">
                <span>01</span>
                <strong>vstup / zadanie</strong>
                <i />
              </div>
              <div className="hero-system-step">
                <span>02</span>
                <strong>proces / riešenie</strong>
                <i />
              </div>
              <div className="hero-system-step">
                <span>03</span>
                <strong>výstup / funguje</strong>
                <i />
              </div>
            </div>

            <div className="hero-system-progress" aria-hidden="true">
              <i />
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="hero-paper-surface absolute inset-x-0 top-0">
        <div className="technology-dot-grid absolute inset-0 opacity-45" />
        <div className="absolute -left-24 top-8 size-72 rounded-full bg-brand/7 blur-3xl sm:size-96" />
        <div className="absolute -right-32 top-24 size-80 rounded-full bg-brand/8 blur-3xl sm:size-[30rem]" />
      </div>

      <Image
        src="/torn-paper-edge.png"
        alt=""
        width={2172}
        height={724}
        loading="eager"
        sizes="(max-width: 1023px) 210vw, 100vw"
        className="hero-paper-edge pointer-events-none absolute z-[3] h-auto max-w-none select-none"
      />
    </>
  )
}
