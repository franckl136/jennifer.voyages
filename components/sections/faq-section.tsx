"use client";

import { Reveal } from "@/components/reveal";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "Comment se déroule une réservation avec vous ?",
    answer:
      "Dès votre première prise de contact, je prends en charge votre demande. À votre écoute, je construis avec vous un voyage entièrement personnalisé, en tenant compte de vos envies, de votre budget et de vos attentes. Une fois le devis validé, mon agence partenaire établit votre contrat de vente. Vous pourrez ensuite confirmer le règlement.",
  },
  {
    question: "Comment se passe le règlement du séjour ?",
    answer:
      "Après validation de votre devis, le contrat vous est envoyé. Plusieurs possibilités s’offrent à vous : lien de paiement sécurisé, virement bancaire, espèces ou chèques-vacances (avec frais).",
  },
  {
    question: "Puis-je souscrire une assurance voyage auprès de vous ?",
    answer:
      "Oui. Je propose deux formules : une assurance annulation pour couvrir les imprévus avant le départ, et une assurance multirisques pour voyager plus sereinement (assistance, bagages, interruption de séjour, etc.). Vous pouvez les souscrire directement lors de votre réservation.",
  },
  {
    question: "Sous quel délai répondez-vous ?",
    answer:
      "En général sous 48 heures ouvrées. Si je suis en déplacement ou déjà prise sur d’autres projets, je vous le dis rapidement pour convenir d’un autre moment.",
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
            Quelques réponses utiles.
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
