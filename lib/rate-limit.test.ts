import { afterEach, describe, expect, it, vi } from "vitest";

const counts = vi.hoisted(() => new Map<string, number>());
const incr = vi.hoisted(() =>
  vi.fn(async (key: string) => {
    const next = (counts.get(key) ?? 0) + 1;
    counts.set(key, next);
    return next;
  }),
);

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      incr,
      expire: async () => 1,
    }),
  },
}));

import { CONTACT_LIMITS, limitContactIp, resetRateLimitForTests } from "./rate-limit";

afterEach(() => {
  counts.clear();
  incr.mockClear();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.VERCEL;
  resetRateLimitForTests();
});

function requestFrom(ip: string) {
  return new Request("https://jennifervoyages.fr/api/contact", {
    headers: { "x-vercel-forwarded-for": ip },
  });
}

describe("limitation partagée", () => {
  it("compte dans Redis entre des appels successifs", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    const now = Date.parse("2026-10-29T12:00:00Z");

    for (let i = 0; i < CONTACT_LIMITS.ip.max; i += 1) {
      expect((await limitContactIp(requestFrom("203.0.113.10"), now)).ok).toBe(true);
    }
    const blocked = await limitContactIp(requestFrom("203.0.113.10"), now);
    expect(blocked.ok).toBe(false);
    expect(incr).toHaveBeenCalled();
    expect(counts.size).toBe(1);
  });

  it("n’utilise pas x-forwarded-for comme identité", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    const now = Date.parse("2026-10-29T12:00:00Z");
    const request = new Request("https://jennifervoyages.fr/api/contact", {
      headers: {
        "x-forwarded-for": "198.51.100.8",
        "x-vercel-forwarded-for": "203.0.113.10",
      },
    });
    await limitContactIp(request, now);
    const otherSpoof = new Request("https://jennifervoyages.fr/api/contact", {
      headers: {
        "x-forwarded-for": "198.51.100.9",
        "x-vercel-forwarded-for": "203.0.113.10",
      },
    });
    await limitContactIp(otherSpoof, now);
    expect(counts.size).toBe(1);
  });

  it("accepte les variables KV_REST_API_* de l’intégration Vercel", async () => {
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "token";
    const now = Date.parse("2026-10-29T12:00:00Z");
    expect((await limitContactIp(requestFrom("203.0.113.10"), now)).ok).toBe(true);
    expect(incr).toHaveBeenCalled();
  });

  it("refuse de compter en mémoire quand le code tourne sur Vercel sans Redis", async () => {
    process.env.VERCEL = "1";
    await expect(limitContactIp(requestFrom("203.0.113.10"))).rejects.toThrow(
      /unavailable/i,
    );
    expect(incr).not.toHaveBeenCalled();
  });
});
