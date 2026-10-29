const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileFailure = { ok: false; status: 400 | 503 };

function hostFromUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function allowedTurnstileHostnames(): string[] {
  const hosts = new Set<string>(["jennifervoyages.fr", "www.jennifervoyages.fr"]);
  const siteHost = hostFromUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (siteHost) {
    hosts.add(siteHost);
    hosts.add(siteHost.startsWith("www.") ? siteHost.slice(4) : `www.${siteHost}`);
  }
  for (const entry of process.env.TURNSTILE_ALLOWED_HOSTNAMES?.split(",") ?? []) {
    const host = entry.trim().toLowerCase();
    if (host) hosts.add(host);
  }
  const vercelHost = process.env.VERCEL_URL?.trim().toLowerCase();
  if (vercelHost) hosts.add(vercelHost.replace(/^https?:\/\//, ""));
  if (process.env.VERCEL_ENV !== "production") {
    hosts.add("localhost");
    hosts.add("127.0.0.1");
  }
  return [...hosts];
}

export async function verifyTurnstile(input: {
  token: unknown;
  remoteIp: string | null;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: true } | TurnstileFailure> {
  if (typeof input.token !== "string") return { ok: false, status: 400 };
  const token = input.token.trim();
  if (!token || token.length > 2048) return { ok: false, status: 400 };

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    console.error("[contact] TURNSTILE_SECRET_KEY manquant");
    return { ok: false, status: 503 };
  }

  const fetchImpl = input.fetchImpl ?? fetch;
  let payload: {
    success?: boolean;
    hostname?: string;
    action?: string;
    "error-codes"?: string[];
  };

  try {
    const response = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        secret,
        response: token,
        ...(input.remoteIp ? { remoteip: input.remoteIp } : {}),
      }),
    });
    if (!response.ok) {
      console.error("[contact] Turnstile HTTP", response.status);
      return { ok: false, status: 503 };
    }
    payload = (await response.json()) as typeof payload;
  } catch (error) {
    console.error("[contact] Turnstile injoignable", error);
    return { ok: false, status: 503 };
  }

  if (!payload?.success) {
    console.error("[contact] Turnstile refusé", payload?.["error-codes"] ?? []);
    return { ok: false, status: 400 };
  }

  const hostname = payload.hostname?.trim().toLowerCase();
  if (!hostname || !allowedTurnstileHostnames().includes(hostname)) {
    console.error("[contact] Turnstile hostname inattendu");
    return { ok: false, status: 400 };
  }

  if (payload.action && payload.action !== "contact") {
    console.error("[contact] Turnstile action inattendue");
    return { ok: false, status: 400 };
  }

  return { ok: true };
}
