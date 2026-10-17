const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  now = Date.now(),
): { ok: boolean; retryAfterSec: number } {
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_HITS) {
    buckets.set(key, recent);
    const retryAfterSec = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - recent[0])) / 1000),
    );
    return { ok: false, retryAfterSec };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { ok: true, retryAfterSec: 0 };
}

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || request.headers.get("x-real-ip")?.trim() || "unknown";
}
