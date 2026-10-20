import {
  BlogArticleBlocks,
  BlogArticleBlocksFallback,
} from "@/components/blog-article-blocks";
import { BlogCoverImage } from "@/components/blog-cover-image";
import {
  getPostBySlug,
  isNotionConfigured,
  listBlogPosts,
} from "@/lib/notion";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const revalidate = 300;

export async function generateStaticParams() {
  if (!isNotionConfigured()) return [];
  try {
    const posts = await listBlogPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (!isNotionConfigured()) {
    return { title: "Article" };
  }
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Article introuvable" };
    return {
      title: post.title,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        type: "article",
        ...(post.coverUrl ? { images: [{ url: post.coverUrl }] } : {}),
      },
    };
  } catch {
    return { title: "Article" };
  }
}

export default async function BlogArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const backHref = from === "accueil" ? "/#blog" : "/blog";
  const backLabel =
    from === "accueil" ? "Retour à l'accueil" : "Retour aux inspirations";

  if (!isNotionConfigured()) {
    notFound();
  }

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) {
    notFound();
  }

  const dateLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-brand-primary/25 hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          {backLabel}
        </Link>

        <header className="border-b border-border pb-10">
          {post.coverUrl ? (
            <>
              {/* Précharge LCP : démarre avant le paint du client component */}
              <link
                rel="preload"
                as="image"
                href={post.coverUrl}
                fetchPriority="high"
              />
              <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-pastel-mist shadow-sm sm:aspect-[2/1]">
                <BlogCoverImage
                  src={post.coverUrl}
                  alt={post.title}
                  priority
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </>
          ) : null}
          {dateLabel ? (
            <p className="mb-3 flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4" aria-hidden />
              {dateLabel}
            </p>
          ) : null}
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {post.excerpt}
            </p>
          ) : null}
        </header>

        <Suspense fallback={<BlogArticleBlocksFallback />}>
          <BlogArticleBlocks pageId={post.id} />
        </Suspense>
      </div>
    </div>
  );
}
