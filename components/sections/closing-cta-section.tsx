import { ContactLink } from "@/components/contact-dialog";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";

export function ClosingCtaSection() {
  return (
    <section
      id="contact-cta"
      className="border-t border-border bg-gradient-to-b from-pastel-mist/30 to-background py-10 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
            <p className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Un projet en tête ?
            </p>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Décrivez-moi votre envie en quelques lignes : on regarde ensemble
              ce qui est possible.
            </p>
            <div className="mt-7 flex justify-center">
              <ContactLink
                source="cta-bas-page"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-[background-color,box-shadow] hover:bg-[#2436a0] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2"
              >
                Parlons-en
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </ContactLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
