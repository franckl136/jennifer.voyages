import { Reveal } from "@/components/reveal";
import { Coffee, Globe, Ticket } from "lucide-react";

const services = [
  {
    title: "Le choix de votre voyage",
    description:
      "Quelles que soient vos envies de voyage, je vous accompagne dans tous vos projets : circuits organisés ou privatifs, séjours, croisières, billetterie, voyages sur mesure… Je vous propose l’ensemble des prestations d’une agence de voyages, vers toutes les destinations du monde.",
    icon: Globe,
    tint: "bg-pastel-mist text-accent-sky",
  },
  {
    title: "Réservation & logistique",
    description:
      "J’effectue les réservations des prestations choisies. Mon agence partenaire se charge ensuite de rédiger le contrat de vente.",
    icon: Ticket,
    tint: "bg-pastel-blush text-accent-coral",
  },
  {
    title: "La remise des documents",
    description:
      "Quelques jours avant votre départ, je vous contacte afin de vous remettre vos documents de voyage en main propre, autour d’un café, dans un lieu public ou directement à votre domicile.",
    icon: Coffee,
    tint: "bg-pastel-sage text-accent-mint",
  },
];

export function ServicesSection() {
  return (
    <section
      id="services"
      className="border-t border-border bg-card py-10 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-mint">
            Mes services
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Les prestations que je vous propose
          </h2>
        </div>

        <ul className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3 lg:gap-8">
          {services.map((item, index) => (
            <li key={item.title} className="h-full">
              <Reveal delayMs={index * 70}>
                <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-background/80 p-6 text-center shadow-sm ring-1 ring-transparent transition-shadow hover:shadow-md hover:ring-border/60">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.tint}`}
                  >
                    <item.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
