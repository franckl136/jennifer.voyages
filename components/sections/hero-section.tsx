import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pastel-mist/40 via-background to-pastel-sand/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(142,189,212,0.22),transparent)]" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 pb-14 pt-8 sm:gap-10 sm:px-6 sm:pb-20 sm:pt-14 lg:pt-20 lg:pb-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center space-y-6 text-center sm:space-y-8">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-coral" aria-hidden />
            Planification sur mesure, humaine et locale
          </p>
          <h1 className="text-balance bg-gradient-to-r from-[#121f66] to-brand-primary bg-clip-text text-[2rem] font-semibold leading-[1.15] tracking-tight text-transparent sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Votre voyage, vos envies, ma passion.
          </h1>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-brand-primary sm:text-lg">
            <p>
              Forte de{" "}
              <strong className="font-semibold">
                nombreuses années d&apos;expérience
              </strong>{" "}
              dans le monde du voyage, je mets mon{" "}
              <strong className="font-semibold">expertise</strong> au service
              de vos plus belles{" "}
              <strong className="font-semibold">envies d&apos;évasion</strong>.
            </p>
            <p>
              Passionnée, j&apos;imagine avec vous des{" "}
              <strong className="font-semibold">voyages sur mesure</strong>,
              pensés dans les{" "}
              <strong className="font-semibold">moindres détails</strong>. Au
              fil de mes expériences, j&apos;ai appris qu&apos;un beau voyage ne
              se résume pas à une destination : c&apos;est avant tout{" "}
              <strong className="font-semibold">
                une envie, une émotion, une rencontre ou un rêve
              </strong>{" "}
              que l&apos;on souhaite réaliser.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              href="/#contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              On en parle ensemble ?
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-pastel-blush/90 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-pastel-sage/80 blur-2xl" />
          <figure className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl ring-1 ring-black/[0.03]">
            <Image
              src="/images/hero.jpg"
              alt="Cartes et carnet de voyage"
              width={720}
              height={900}
              className="h-64 w-full object-cover sm:h-80 lg:h-96"
              priority
              sizes="(max-width: 768px) 100vw, 42rem"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-4 pt-12 sm:p-6 sm:pt-16">
              <p className="text-center text-sm font-medium text-white drop-shadow-sm">
                Votre rythme, vos envies, votre budget — et l&apos;envie
                folle d&apos;un ailleurs qui vous ressemble.
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
