import { ContactLink } from "@/components/contact-dialog";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent-sky">
        Erreur 404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Page introuvable
      </h1>
      <p className="mt-4 text-muted">
        Cette adresse n&apos;existe pas ou l&apos;article a été retiré. Revenez
        à l&apos;accueil pour poursuivre votre exploration.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Retour à l&apos;accueil
        </Link>
        <ContactLink
          source="page-404"
          className="inline-flex rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-pastel-mist/60"
        >
          Me contacter
        </ContactLink>
      </div>
    </div>
  );
}
