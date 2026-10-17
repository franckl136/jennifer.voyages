"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent-coral">
        Erreur
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Une erreur est survenue
      </h1>
      <p className="mt-4 text-muted">
        Le chargement de cette page a échoué. Vous pouvez réessayer, ou revenir
        à l&apos;accueil.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-pastel-mist/60"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
