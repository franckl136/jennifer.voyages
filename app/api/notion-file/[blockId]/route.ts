import {
  fetchFreshBlockFileUrl,
  isNotionConfigured,
  normalizeNotionDatabaseId,
} from "@/lib/notion";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ blockId: string }> };

/** Proxy d’octets CDN pour images / fichiers de blocs Notion. */
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

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return new NextResponse("Fichier indisponible", { status: 502 });
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
    return new NextResponse("Erreur fichier", { status: 500 });
  }
}
