import { BlogPostGrid } from "@/components/blog-post-grid";
import { isNotionConfigured, listBlogPosts } from "@/lib/notion";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Inspirations",
  description:
    "Carnets de voyage et inspirations de Jennifer & Voyages.",
};

export default async function BlogIndexPage() {
  let posts: Awaited<ReturnType<typeof listBlogPosts>> = [];

  if (isNotionConfigured()) {
    try {
      posts = await listBlogPosts();
    } catch {
      posts = [];
    }
  }

  return (
    <div className="bg-gradient-to-b from-pastel-sand/40 to-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <Link
          href="/#blog"
          className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-brand-primary/25 hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Précédent
        </Link>

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-coral">
            Carnets
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Toutes les inspirations
          </h1>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Destinations à explorer et retours d’expérience.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="mx-auto mt-12 max-w-xl rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted">
            Mes carnets de voyage arrivent bientôt.
          </p>
        ) : (
          <div className="mt-12">
            <BlogPostGrid posts={posts} from="liste" />
          </div>
        )}
      </div>
    </div>
  );
}
