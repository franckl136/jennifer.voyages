import { BlogPostGrid } from "@/components/blog-post-grid";
import { listBlogPosts, isNotionConfigured } from "@/lib/notion";
import { ArrowRight } from "lucide-react";
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

  const visiblePosts = posts.slice(0, 3);

  return (
    <section
      id="blog"
      className="bg-gradient-to-b from-pastel-sand/40 to-background py-10 sm:py-14 lg:py-16"
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
          <>
            <div className="mt-12">
              <BlogPostGrid posts={visiblePosts} from="accueil" />
            </div>
            {posts.length > 3 ? (
              <div className="mt-8 text-center">
                <Link
                  href="/blog"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
                >
                  Tous les articles
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
