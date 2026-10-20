import { BlogCoverImage } from "@/components/blog-cover-image";
import { ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";

export type BlogCardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  publishedAt?: string | null;
};

export function BlogPostGrid({
  posts,
  from,
}: {
  posts: BlogCardPost[];
  from?: "accueil" | "liste";
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-6">
      {posts.map((post, index) => (
        <Link
          key={post.id}
          href={
            from
              ? `/blog/${post.slug}?from=${from}`
              : `/blog/${post.slug}`
          }
          className="group flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg sm:w-[calc(50%-0.75rem)] sm:max-w-none md:w-[calc((100%-3rem)/3)]"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-pastel-mist">
            {post.coverUrl ? (
              <BlogCoverImage
                src={post.coverUrl}
                alt={post.title}
                priority={index < 3}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105"
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
  );
}
