import {
  fetchFreshCoverUrl,
  isNotionConfigured,
  normalizeNotionDatabaseId,
} from "@/lib/notion";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ pageId: string }> };

/**
 * Redirige vers une URL Notion fraîche (S3 signée ~1 h).
 * Plus rapide qu’un proxy d’octets : le navigateur charge directement depuis S3.
 * Cache CDN < 1 h pour limiter les appels Notion.
 */
export async function GET(_request: Request, context: RouteContext) {
  if (!isNotionConfigured()) {
    return new NextResponse("Notion non configuré", { status: 503 });
  }

  const { pageId: raw } = await context.params;
  const pageId = normalizeNotionDatabaseId(raw);

  try {
    const url = await fetchFreshCoverUrl(pageId);
    if (!url) {
      return new NextResponse("Image introuvable", { status: 404 });
    }

    const res = NextResponse.redirect(url, 307);
    res.headers.set(
      "Cache-Control",
      "public, s-maxage=3000, stale-while-revalidate=600",
    );
    return res;
  } catch {
    return new NextResponse("Erreur image", { status: 500 });
  }
}
