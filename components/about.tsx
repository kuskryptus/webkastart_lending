import Image from 'next/image'
import Link from 'next/link'
import { FaFacebookF, FaInstagram } from 'react-icons/fa'
import { SectionLabel } from '@/components/section-label'

export function About() {
  return (
    <section id="preco-webkastart" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-14">
        {/* Image */}
        <div className="min-w-0 overflow-hidden rounded-2xl">
          <Image
            src="/kristian-about-landscape.png"
            alt="Vývojár pracujúci na notebooku"
            width={941}
            height={724}
            className="aspect-[13/10] w-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <SectionLabel>Prečo WebkaStart?</SectionLabel>
          <h2 className="mt-4 text-pretty text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Kristián Kampczyk
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            Som živnostník s 5 rokmi skúseností s vývojom rôznych riešení pre firmy
            aj vlastných nástrojov pre seba. Práve preto som sa rozhodol založiť
            WebkaStart a posunúť tieto skúsenosti ďalej.
          </p>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            V auguste 2026 som si založil živnosť s cieľom pomáhať firmám
            automatizovať a zjednodušovať manuálnu a repetitívnu prácu. WebkaStart
            je miesto, kde sa tieto riešenia môžu začať a kde sa aj menšie podnikanie
            môže viac zviditeľniť.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-9 gap-y-4">
            <Link
              href="https://www.instagram.com/kristiankampczyk/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 text-sm font-medium text-foreground transition duration-200 hover:-translate-y-0.5 hover:opacity-75"
            >
              <FaInstagram className="size-5 text-[#E4405F]" aria-hidden="true" />
              Instagram
            </Link>
            <Link
              href="https://www.facebook.com/kristian.kampczyk.3"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 text-sm font-medium text-foreground transition duration-200 hover:-translate-y-0.5 hover:opacity-75"
            >
              <FaFacebookF className="size-5 text-[#1877F2]" aria-hidden="true" />
              Facebook
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
