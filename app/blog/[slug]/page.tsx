import {
  BlogArticleBlocks,
  BlogArticleBlocksFallback,
} from "@/components/blog-article-blocks";
import {
  getPostBySlug,
  isNotionConfigured,
  listBlogPosts,
} from "@/lib/notion";
import { ArrowLeft, Clock } from "lucide-react";
import Image from "next/image";
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

type Props = { params: Promise<{ slug: string }> };

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

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;

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
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/#blog"
          className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour au blog
        </Link>

        <header className="border-b border-border pb-10">
          {post.coverUrl ? (
            <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-pastel-mist shadow-sm sm:aspect-[2/1]">
              <Image
                src={post.coverUrl}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 48rem"
                priority
                unoptimized
              />
            </div>
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
