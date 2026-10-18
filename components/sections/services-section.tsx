import { BookOpen, MapPinned, Ticket } from "lucide-react";

const services = [
  {
    title: "Conception d’itinéraires",
    description:
      "Jours équilibrés, temps de trajet réalistes et idées d’activités selon votre façon de voyager : ville, route ou voyage au ralenti.",
    icon: MapPinned,
    tint: "bg-pastel-mist text-accent-sky",
  },
  {
    title: "Réservation & logistique",
    description:
      "Repérage d’hébergements et options de transport, points d’attention (horaires, transferts) pour que vous arriviez sereinement sur place.",
    icon: Ticket,
    tint: "bg-pastel-blush text-accent-coral",
  },
  {
    title: "Conseils personnalisés",
    description:
      "Bonnes adresses, saisonnalité, faux bons plans à éviter et astuces pratiques pour profiter sans vous prendre la tête.",
    icon: BookOpen,
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
            Trois façons de vous décharger de la préparation
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Chaque accompagnement est adapté à votre projet : vous gardez la
            main, je structure et sécurise les choix.
          </p>
        </div>

        <ul className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3 lg:gap-8">
          {services.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm ring-1 ring-transparent transition-shadow hover:shadow-md hover:ring-border/60"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.tint}`}
              >
                <item.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
