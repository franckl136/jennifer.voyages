import {
  fetchFreshBlockFileUrl,
  isNotionConfigured,
  normalizeNotionDatabaseId,
} from "@/lib/notion";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ blockId: string }> };

/** Redirection vers URL Notion fraîche (même logique que les couvertures). */
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

    const res = NextResponse.redirect(url, 307);
    res.headers.set(
      "Cache-Control",
      "public, s-maxage=3000, stale-while-revalidate=600",
    );
    return res;
  } catch {
    return new NextResponse("Erreur fichier", { status: 500 });
  }
}
