"use client";

import { Reveal } from "@/components/reveal";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "Sous quel délai répondez-vous ?",
    answer:
      "En général sous 48 heures ouvrées. Si je suis en déplacement ou déjà prise sur d’autres projets, je vous le dis rapidement pour convenir d’un autre moment.",
  },
  {
    question: "Combien de temps faut-il pour préparer un voyage ?",
    answer:
      "Cela dépend de la destination, des dates et de ce que vous souhaitez. Un projet simple peut se préparer en quelques échanges. Un itinéraire plus détaillé demande souvent deux à trois semaines, parfois davantage en haute saison. On fixe un rythme réaliste dès le départ.",
  },
  {
    question: "Comment abordez-vous le budget ?",
    answer:
      "On part de votre enveloppe et de vos priorités : hébergement, rythme, expériences… Je propose ensuite des options qui collent à ce que vous pouvez y consacrer, sans vous orienter vers quelque chose qui ne vous convient pas. Les frais de mon accompagnement sont annoncés clairement avant que l’on avance.",
  },
  {
    question: "Le premier message m’engage-t-il ?",
    answer:
      "Non. Écrire sert d’abord à échanger sur votre projet et à voir si l’on peut travailler ensemble. Il n’y a engagement que lorsque l’on se met d’accord sur la suite et sur les conditions.",
  },
];

function clearSelection() {
  const selection = window.getSelection();
  selection?.removeAllRanges();
}

export function FaqSection() {
  return (
    <section
      id="faq"
      className="border-t border-border bg-card py-10 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-lilac">
            FAQ
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Les questions que l’on me pose souvent
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Quelques réponses utiles avant de m’écrire.
          </p>
        </div>

        <div className="mt-10 space-y-3 sm:mt-12">
          {faqs.map((item, index) => (
            <Reveal key={item.question} delayMs={index * 40}>
              <details
                className="group rounded-2xl border border-border bg-background/80 px-5 py-1 shadow-sm open:shadow-md"
                onToggle={clearSelection}
              >
                <summary
                  className="cursor-pointer list-none select-none py-4 text-left text-base font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden"
                  onMouseDown={(e) => {
                    if (e.detail > 1) e.preventDefault();
                  }}
                >
                  <span className="flex items-start justify-between gap-4">
                    {item.question}
                    <Plus
                      className="mt-0.5 h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-45"
                      aria-hidden
                    />
                  </span>
                </summary>
                <p className="border-t border-border/80 pb-4 pt-3 text-sm leading-relaxed text-muted sm:text-[15px]">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
