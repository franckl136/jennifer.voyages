import { NextResponse } from "next/server";

const CACHE =
  "public, s-maxage=86400, stale-while-revalidate=604800";

/**
 * Proxy les octets Notion vers une URL stable CDN-cachable.
 * (Pas de sharp ici : le binaire natif casse le build Windows → Linux Vercel.)
 */
export async function notionImageResponse(sourceUrl: string) {
  const upstream = await fetch(sourceUrl);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Image indisponible", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE,
    },
  });
}
