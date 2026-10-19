import { Reveal } from "@/components/reveal";
import Image from "next/image";

export function AboutSection() {
  return (
    <section
      id="a-propos"
      className="border-t border-border bg-card py-10 sm:py-14 lg:py-16"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-stretch md:gap-12 lg:px-8 lg:gap-16">
        <Reveal className="order-2 md:order-1">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-border shadow-lg sm:aspect-[5/4] md:mx-0 md:max-w-none md:aspect-[4/5]">
            <Image
              src="/images/jennifer/chichen-itza.jpg"
              alt="Jennifer devant la pyramide de Chichén Itzá, au Mexique"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center"
            />
          </div>
        </Reveal>

        <Reveal
          delayMs={80}
          className="order-1 md:order-2 md:flex md:items-center"
        >
          <div className="mx-auto w-full max-w-xl text-center md:mx-0 md:max-w-none">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-lilac">
              Qui suis-je ?
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Nouvel envol, même passion : le voyage
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
              <p>
                Après plus de 30 ans en agence de voyages à accompagner de
                nombreux clients, je me lance dans une nouvelle aventure :
                celle de Travel Planner.
              </p>
              <p>
                Je mets mon expertise au service de vos plus belles envies
                d&apos;évasion, avec sincérité et bienveillance, pour un voyage
                pensé avec vous, à votre image.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
