import {
  fetchFreshCoverUrl,
  isNotionConfigured,
  normalizeNotionDatabaseId,
} from "@/lib/notion";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ pageId: string }> };

/**
 * Proxy stable des couvertures Notion : les URLs S3 signées expirent ~1 h.
 * On renvoie les octets avec un cache CDN long ; `?v=` (last_edited) bust le cache.
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

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return new NextResponse("Image indisponible", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Erreur image", { status: 500 });
  }
}
