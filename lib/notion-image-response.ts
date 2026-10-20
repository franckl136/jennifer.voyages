import sharp from "sharp";
import { NextResponse } from "next/server";

const CACHE =
  "public, s-maxage=86400, stale-while-revalidate=604800";

/** Largeur max écran article / grille (2x pour rétina ~1600). */
const MAX_WIDTH = 1600;

/**
 * Télécharge une URL Notion, redimensionne / compresse (JPEG),
 * renvoie une réponse CDN-cachable — bien plus légère que l’original iPhone.
 */
export async function notionImageResponse(sourceUrl: string) {
  const upstream = await fetch(sourceUrl);
  if (!upstream.ok) {
    return new NextResponse("Image indisponible", { status: 502 });
  }

  const input = Buffer.from(await upstream.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toBuffer();

  return new NextResponse(new Uint8Array(output), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": CACHE,
    },
  });
}
