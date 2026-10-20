import { notionImageResponse } from "@/lib/notion-image-response";
import {
  fetchFreshBlockFileUrl,
  isNotionConfigured,
  normalizeNotionDatabaseId,
} from "@/lib/notion";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ blockId: string }> };

/** Image de bloc Notion : compressée + cache CDN. */
export async function GET(_request: Request, context: RouteContext) {
  if (!isNotionConfigured()) {
    return new NextResponse("Notion non configuré", { status: 503 });
  }

  const { blockId: raw } = await context.params;
  const blockId = normalizeNotionDatabaseId(raw);

  try {
    const url = await fetchFreshBlockFileUrl(blockId);
    if (!url) {
      return new NextResponse("Fichier introuvable", { status: 404 });
    }
    return await notionImageResponse(url);
  } catch {
    return new NextResponse("Erreur fichier", { status: 500 });
  }
}
