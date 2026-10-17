import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Revalidation manuelle / webhook Notion.
 * POST avec header Authorization: Bearer <REVALIDATE_SECRET>
 * ou ?secret= dans la query.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET non configuré." },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");

  if (bearer !== secret && querySecret !== secret) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  revalidateTag("notion-blog");
  return NextResponse.json({
    revalidated: true,
    tag: "notion-blog",
    now: Date.now(),
  });
}
