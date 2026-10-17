import { listBlogPosts, isNotionConfigured } from "@/lib/notion";
import { Clock, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export async function BlogSection() {
  let posts: Awaited<ReturnType<typeof listBlogPosts>> = [];

  if (isNotionConfigured()) {
    try {
      posts = await listBlogPosts();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Blog] Échec Notion (listBlogPosts) :", err);
      }
      posts = [];
    }
  }

  return (
    <section
      id="blog"
      className="scroll-mt-24 bg-gradient-to-b from-pastel-sand/40 to-background py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-coral">
            Blog
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Inspirations de voyage et retours de terrain
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Destinations, saisons et retours d&apos;expérience pour préparer
            votre prochain départ.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="mx-auto mt-12 max-w-xl rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted">
            {isNotionConfigured()
              ? "Mes carnets de voyage arrivent bientôt. En attendant, contactez-moi pour discuter de votre projet."
              : "Configurez NOTION_TOKEN et NOTION_DATABASE_ID dans .env.local pour afficher les articles."}
          </p>
        ) : (
          <div
            className={
              posts.length === 1
                ? "mx-auto mt-12 flex w-full max-w-5xl justify-center"
                : "mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 sm:justify-items-stretch md:grid-cols-3"
            }
          >
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg ${
                  posts.length === 1 ? "max-w-md" : "max-w-md sm:max-w-none"
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-pastel-mist">
                  {post.coverUrl ? (
                    <Image
                      src={post.coverUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pastel-mist to-pastel-blush text-sm text-muted"
                      aria-hidden
                    >
                      Jennifer & Voyages
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {post.publishedAt ? (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  ) : null}
                  <h3 className="mt-2 line-clamp-3 text-lg font-semibold leading-snug text-foreground">
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-sky transition-colors group-hover:text-accent-mint">
                    Lire l’article
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
