export default function BlogArticleLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 h-5 w-40 animate-pulse rounded bg-pastel-mist" />
        <div className="mb-8 aspect-[21/9] w-full animate-pulse rounded-2xl bg-pastel-mist sm:aspect-[2/1]" />
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-pastel-mist" />
        <div className="h-10 w-full max-w-2xl animate-pulse rounded bg-pastel-mist" />
        <div className="mt-4 h-6 w-full max-w-xl animate-pulse rounded bg-pastel-mist/80" />
        <div className="mt-12 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-pastel-mist" />
          <div className="h-4 w-full animate-pulse rounded bg-pastel-mist" />
          <div className="h-4 w-[85%] animate-pulse rounded bg-pastel-mist" />
        </div>
      </div>
    </div>
  );
}
