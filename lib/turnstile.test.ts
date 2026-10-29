import { afterEach, describe, expect, it, vi } from "vitest";

import { verifyTurnstile } from "./turnstile";

const keys = [
  "TURNSTILE_SECRET_KEY",
  "TURNSTILE_ALLOWED_HOSTNAMES",
  "VERCEL_ENV",
  "VERCEL_URL",
  "NEXT_PUBLIC_SITE_URL",
] as const;

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of keys) delete process.env[key];
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Turnstile", () => {
  it("rejette un jeton absent, vide ou trop long", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    expect((await verifyTurnstile({ token: "", remoteIp: null })).ok).toBe(false);
    expect((await verifyTurnstile({ token: "   ", remoteIp: null })).ok).toBe(false);
    expect(
      (await verifyTurnstile({ token: "x".repeat(2049), remoteIp: null })).ok,
    ).toBe(false);
  });

  it("rejette un jeton invalide, expiré ou déjà utilisé", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ success: false, "error-codes": ["timeout-or-duplicate"] }),
    );
    const result = await verifyTurnstile({
      token: "deja-utilise",
      remoteIp: "203.0.113.10",
      fetchImpl,
    });
    expect(result).toEqual({ ok: false, status: 400 });
    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body));
    expect(body.secret).toBe("secret");
    expect(body.response).toBe("deja-utilise");
    expect(body.remoteip).toBe("203.0.113.10");
  });

  it("rejette un hostname inattendu", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.VERCEL_ENV = "production";
    const result = await verifyTurnstile({
      token: "ok",
      remoteIp: null,
      fetchImpl: async () =>
        jsonResponse({
          success: true,
          hostname: "evil.example",
          action: "contact",
        }),
    });
    expect(result).toEqual({ ok: false, status: 400 });
  });

  it("accepte un jeton valide pour le domaine attendu", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.VERCEL_ENV = "production";
    const result = await verifyTurnstile({
      token: "ok",
      remoteIp: null,
      fetchImpl: async () =>
        jsonResponse({
          success: true,
          hostname: "www.jennifervoyages.fr",
          action: "contact",
        }),
    });
    expect(result).toEqual({ ok: true });
  });

  it("reste fermé si la clé secrète est absente", async () => {
    const result = await verifyTurnstile({ token: "ok", remoteIp: null });
    expect(result).toEqual({ ok: false, status: 503 });
  });
});
