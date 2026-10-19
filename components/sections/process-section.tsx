import { Reveal } from "@/components/reveal";

const steps = [
  {
    title: "Premier contact",
    description:
      "Vous me parlez de vos envies, de votre rythme et de votre budget. Je prends le temps de comprendre ce qui compte vraiment pour vous.",
    tint: "bg-pastel-mist text-accent-sky",
  },
  {
    title: "Pistes et ajustements",
    description:
      "Je vous présente des pistes concrètes. On les discute, on les ajuste, jusqu’à ce que le projet vous ressemble vraiment.",
    tint: "bg-pastel-blush text-accent-coral",
  },
  {
    title: "Départ en toute confiance",
    description:
      "Une fois tout en place, vous avez un voyage clair et prêt. Il ne vous reste plus qu’à profiter du départ.",
    tint: "bg-pastel-sage text-accent-mint",
  },
];

export function ProcessSection() {
  return (
    <section
      id="parcours"
      className="border-t border-border bg-gradient-to-b from-background to-pastel-mist/30 py-10 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-sky">
            Comment ça se passe
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Un accompagnement simple, étape par étape
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            On avance ensemble, à votre rythme, jusqu’au départ.
          </p>
        </div>

        <ol className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="h-full">
              <Reveal delayMs={index * 70}>
                <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm ring-1 ring-transparent transition-shadow hover:shadow-md hover:ring-border/60">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold tabular-nums ${step.tint}`}
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
