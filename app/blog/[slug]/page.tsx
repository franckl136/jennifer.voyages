import {
  BlogArticleBlocks,
  BlogArticleBlocksFallback,
} from "@/components/blog-article-blocks";
import { SectionLink } from "@/components/section-link";
import { SoftImage } from "@/components/soft-image";
import {
  getPostBySlug,
  isNotionConfigured,
  listBlogPosts,
} from "@/lib/notion";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const backClass =
  "mb-8 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40";

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
  const tabTitle = { absolute: "Jennifer & Voyages" as const };
  // Onglet fixe ; le titre article reste pour le partage social (OG)
  if (!isNotionConfigured()) {
    return { title: tabTitle };
  }
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: tabTitle };
    return {
      title: tabTitle,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        type: "article" as const,
        ...(post.coverUrl ? { images: [{ url: post.coverUrl }] } : {}),
      },
    };
  } catch {
    return { title: tabTitle };
  }
}

export default async function BlogArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;

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
        {from === "accueil" ? (
          <SectionLink sectionId="blog" className={backClass}>
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Précédent
          </SectionLink>
        ) : (
          <Link href="/blog" className={backClass}>
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Précédent
          </Link>
        )}

        <header className="border-b border-border pb-10">
          {post.coverUrl ? (
            <>
              <link
                rel="preload"
                as="image"
                href={post.coverUrl}
                fetchPriority="high"
              />
              <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-pastel-mist shadow-sm sm:aspect-[2/1]">
                <SoftImage
                  src={post.coverUrl}
                  alt={post.title}
                  priority
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
