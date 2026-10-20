import { backLinkClass } from "@/lib/back-link";
import { SITE } from "@/lib/site";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Jennifer & Voyages" },
  description:
    "Mentions légales, protection des données (RGPD) et conditions générales d’utilisation du site jennifervoyages.fr.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link href="/" className={`mb-2 ${backLinkClass}`}>
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Précédent
        </Link>

        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-foreground">
          Mentions légales
        </h1>
        <p className="mt-2 text-sm text-muted">
          Dernière mise à jour : octobre 2026
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-foreground">
          <section className="space-y-4" aria-labelledby="ml-i">
            <h2 id="ml-i" className="text-xl font-semibold text-foreground">
              I. Mentions légales
            </h2>
            <p>
              <strong className="font-medium">Éditeur :</strong> Jennifer
              Iguazel, entrepreneur individuel, exerçant sous le nom commercial
              Jennifer &amp; Voyages.
            </p>
            <p>
              <strong className="font-medium">
                Directrice de la publication :
              </strong>{" "}
              Jennifer Iguazel.
            </p>
            <p>
              <strong className="font-medium">Adresse :</strong> 741, Route de
              Castillon, 30210 Vers-Pont-du-Gard.
            </p>
            <p>
              <strong className="font-medium">Immatriculation :</strong> SIREN
              107 102 501 — SIRET 107 102 501 00015 — RCS Nîmes. Code APE
              82.99Z.
            </p>
            <p>
              <strong className="font-medium">TVA :</strong> TVA non applicable,
              article 293 B du CGI.
            </p>
            <p>
              <strong className="font-medium">Contact :</strong>{" "}
              <a
                href={`tel:+${SITE.phoneE164}`}
                className="font-medium text-brand-primary underline underline-offset-2 hover:opacity-90"
              >
                {SITE.phoneDisplay}
              </a>
              {" — "}
              <a
                href={`mailto:${SITE.email}`}
                className="break-all font-medium text-brand-primary underline underline-offset-2 hover:opacity-90"
              >
                {SITE.email}
              </a>
              .
            </p>
            <p>
              <strong className="font-medium">Hébergeur :</strong> Vercel Inc.,
              340 S Lemon Ave #1150, Walnut, CA 91789, USA.
            </p>
          </section>

          <section
            id="confidentialite"
            className="space-y-4 rounded-2xl target:bg-pastel-mist/80 target:px-5 target:py-5"
            aria-labelledby="ml-ii"
          >
            <h2 id="ml-ii" className="text-xl font-semibold text-foreground">
              II. Politique de confidentialité (RGPD)
            </h2>
            <p>
              <strong className="font-medium">Collecte des données :</strong>{" "}
              Les informations recueillies via le formulaire de contact (nom,
              email, destination souhaitée, message) sont nécessaires pour
              l&apos;établissement de vos devis et itinéraires.
            </p>
            <p>
              <strong className="font-medium">Conservation :</strong> Vos
              données sont conservées pendant une durée de 3 ans après le
              dernier contact.
            </p>
            <p>
              <strong className="font-medium">Vos droits :</strong> Conformément
              au RGPD, vous disposez d&apos;un droit d&apos;accès, de
              rectification et de suppression de vos données en écrivant à{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="break-all font-medium text-brand-primary underline underline-offset-2 hover:opacity-90"
              >
                {SITE.email}
              </a>
              .
            </p>
            <p>
              <strong className="font-medium">Sous-traitants :</strong> les
              messages du formulaire (nom, email, destination, message) sont
              transmis à Resend, Inc. (États-Unis) pour l&apos;envoi de
              l&apos;email. Le site est hébergé par Vercel Inc. (États-Unis).
              Les articles du blog sont stockés chez Notion Labs, Inc.
              (États-Unis) ; cette base ne contient pas les messages du
              formulaire. Les boutons WhatsApp et Instagram ouvrent les pages
              correspondantes chez Meta : aucune donnée du formulaire n&apos;y
              est envoyée.
            </p>
            <p>
              <strong className="font-medium">Cookies :</strong> ce site ne
              dépose pas de cookie publicitaire ni de mesure d&apos;audience.
            </p>
          </section>

          <section className="space-y-4" aria-labelledby="ml-iii">
            <h2 id="ml-iii" className="text-xl font-semibold text-foreground">
              III. Conditions générales d&apos;utilisation (CGU)
            </h2>
            <p>
              Ce site présente les services de conseil en voyage de Jennifer
              Iguazel. Les informations sont données avec soin, sans pouvoir
              couvrir les imprévus d&apos;un voyage.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
