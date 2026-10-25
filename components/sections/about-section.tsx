import { ProfileCoverPrefetch } from "@/components/profile-cover-prefetch";
import { Reveal } from "@/components/reveal";
import { PROFILE_POST_SLUG } from "@/lib/site";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

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
              Une passionnée des voyages
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
              <p>
                L&apos;attachement à mon métier et mon expérience en agence à
                Nîmes m&apos;ont donné envie de poursuivre mon parcours
                différemment, en choisissant l&apos;indépendance pour placer
                la clientèle, l&apos;écoute et le conseil personnalisé au
                cœur de mon accompagnement.
              </p>
              <p className="font-medium text-foreground">Jennifer</p>
              <Link
                href={`/blog/${PROFILE_POST_SLUG}?from=a-propos`}
                prefetch
                className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-pastel-mist/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2"
              >
                Mon parcours, ma vision
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Suspense fallback={null}>
                <ProfileCoverPrefetch />
              </Suspense>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
