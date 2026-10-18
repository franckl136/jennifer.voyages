/** Empilements légers pour Suspense / dynamic sur la page d’accueil. */

export function BlogSectionSkeleton() {
  return (
    <section
      id="blog"
      className="bg-gradient-to-b from-pastel-sand/40 to-background py-10 sm:py-14 lg:py-16"
      aria-busy="true"
      aria-label="Chargement du blog"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <div className="mx-auto h-5 w-16 animate-pulse rounded bg-pastel-mist" />
          <div className="mx-auto h-10 max-w-lg animate-pulse rounded bg-pastel-mist" />
          <div className="mx-auto h-6 max-w-xl animate-pulse rounded bg-pastel-mist/90" />
        </div>
        <div className="mx-auto mt-12 grid w-full max-w-5xl gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60"
            >
              <div className="aspect-[16/10] animate-pulse bg-pastel-mist" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-pastel-mist" />
                <div className="h-5 w-full animate-pulse rounded bg-pastel-mist" />
                <div className="h-4 w-full animate-pulse rounded bg-pastel-mist" />
                <div className="h-4 w-[80%] animate-pulse rounded bg-pastel-mist" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSectionSkeleton() {
  return (
    <section
      id="contact"
      className="border-t border-border bg-pastel-mist/25 py-10 sm:py-14 lg:py-16"
      aria-busy="true"
      aria-label="Chargement du contact"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <div className="mx-auto h-5 w-24 animate-pulse rounded bg-pastel-mist" />
          <div className="mx-auto h-10 max-w-md animate-pulse rounded bg-pastel-mist" />
          <div className="mx-auto h-6 max-w-lg animate-pulse rounded bg-pastel-mist/80" />
        </div>
        <div className="mx-auto mt-12 max-w-xl space-y-4 rounded-2xl border border-border bg-card/80 p-8">
          <div className="h-11 w-full animate-pulse rounded-xl bg-pastel-mist" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-pastel-mist" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-pastel-mist" />
        </div>
      </div>
    </section>
  );
}
