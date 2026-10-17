import { NotionContent } from "@/components/notion-content";
import { getPageBlocks } from "@/lib/notion";
import { notFound } from "next/navigation";

type Props = { pageId: string };

/**
 * Corps de l’article chargé séparément pour permettre le streaming (Suspense).
 */
export async function BlogArticleBlocks({ pageId }: Props) {
  let blocks;
  try {
    blocks = await getPageBlocks(pageId);
  } catch {
    notFound();
  }
  return (
    <div className="py-12">
      <NotionContent blocks={blocks} />
    </div>
  );
}

export function BlogArticleBlocksFallback() {
  return (
    <div className="space-y-3 py-12" aria-hidden>
      <div className="h-4 w-full animate-pulse rounded bg-pastel-mist" />
      <div className="h-4 w-full animate-pulse rounded bg-pastel-mist" />
      <div className="h-4 w-[92%] animate-pulse rounded bg-pastel-mist" />
      <div className="h-4 w-full animate-pulse rounded bg-pastel-mist" />
      <div className="h-4 w-[75%] animate-pulse rounded bg-pastel-mist" />
    </div>
  );
}
