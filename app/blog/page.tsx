import { BlogPostGrid } from "@/components/blog-post-grid";
import { SectionLink } from "@/components/section-link";
import { backLinkClass } from "@/lib/back-link";
import { isNotionConfigured, listBlogPosts } from "@/lib/notion";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Jennifer & Voyages" },
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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <header className="relative">
          <SectionLink
            sectionId="blog"
            className={`absolute left-0 top-0 z-10 ${backLinkClass} min-h-0 py-0`}
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Accueil
          </SectionLink>

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
        </header>

        {posts.length === 0 ? (
          <p className="mx-auto mt-12 max-w-xl rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted">
            Mes carnets de voyage arrivent bientôt.
          </p>
        ) : (
          <div className="mt-12 sm:mt-14">
            <BlogPostGrid posts={posts} from="liste" />
          </div>
        )}
      </div>
    </div>
  );
}
