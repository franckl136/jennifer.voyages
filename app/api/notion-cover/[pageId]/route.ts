import { notionImageResponse } from "@/lib/notion-image-response";
import {
  fetchFreshCoverUrl,
  isNotionConfigured,
  normalizeNotionDatabaseId,
} from "@/lib/notion";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ pageId: string }> };

/**
 * Couverture Notion : octets compressés + cache CDN long sur URL stable.
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
    return await notionImageResponse(url);
  } catch {
    return new NextResponse("Erreur image", { status: 500 });
  }
}
