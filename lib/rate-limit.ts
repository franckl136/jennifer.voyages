import { createHash } from "node:crypto";

import { Redis } from "@upstash/redis";

/** Fenêtre fixe partagée via Redis. Le repli mémoire n’existe qu’en dehors de Vercel. */
export const CONTACT_LIMITS = {
  ip: { max: 5, windowSec: 10 * 60 },
  email: { max: 5, windowSec: 60 * 60 },
} as const;

export class RateLimitUnavailableError extends Error {
  constructor() {
    super("Rate limit store unavailable");
    this.name = "RateLimitUnavailableError";
  }
}

export type RateLimitResult = { ok: true; retryAfterSec: 0 } | {
  ok: false;
  retryAfterSec: number;
};

type Counter = {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<unknown>;
};

const memoryBuckets = new Map<string, { count: number; expiresAt: number }>();
let redisClient: Redis | null = null;
let devMemoryWarned = false;

const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;

function isIp(value: string): boolean {
  if (IPV4.test(value)) {
    return value.split(".").every((part) => {
      const n = Number(part);
      return n >= 0 && n <= 255;
    });
  }
  return value.includes(":") && /^[0-9a-f:]+$/i.test(value) && value.length <= 64;
}

/** Première IP posée par la plateforme. `x-forwarded-for` client n’est pas lu. */
export function trustedClientAddress(request: Request): string | null {
  for (const header of ["x-vercel-forwarded-for", "x-real-ip"] as const) {
    const first = request.headers.get(header)?.split(",")[0]?.trim() ?? "";
    if (first && isIp(first)) return first;
  }
  return null;
}

function digest(value: string): string {
  const salt =
    process.env.CONTACT_RATE_LIMIT_SALT?.trim() ||
    process.env.TURNSTILE_SECRET_KEY?.trim() ||
    process.env.RESEND_API_KEY?.trim() ||
    "jv-contact-dev";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

function memoryCounter(): Counter {
  if (!devMemoryWarned && process.env.NODE_ENV !== "test") {
    devMemoryWarned = true;
    console.warn(
      "[contact] limitation en mémoire : développement local uniquement, sans partage entre instances.",
    );
  }
  return {
    async incr(key) {
      const now = Date.now();
      const current = memoryBuckets.get(key);
      if (!current || current.expiresAt <= now) {
        memoryBuckets.set(key, { count: 1, expiresAt: now + 60_000 });
        return 1;
      }
      current.count += 1;
      return current.count;
    },
    async expire(key, seconds) {
      const current = memoryBuckets.get(key);
      if (current) current.expiresAt = Date.now() + seconds * 1000;
    },
  };
}

function redisCounter(): Counter {
  if (!redisClient) redisClient = Redis.fromEnv();
  const redis = redisClient;
  return {
    incr: (key) => redis.incr(key),
    expire: (key, seconds) => redis.expire(key, seconds),
  };
}

function redisConfigured(): boolean {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();
  return Boolean(url && token);
}

function counter(): Counter {
  if (redisConfigured()) {
    return redisCounter();
  }
  if (process.env.VERCEL) throw new RateLimitUnavailableError();
  return memoryCounter();
}

async function hit(
  id: string,
  max: number,
  windowSec: number,
  now: number,
): Promise<RateLimitResult> {
  const windowMs = windowSec * 1000;
  const bucket = Math.floor(now / windowMs);
  const key = `contact:${id}:${bucket}`;
  const ttlSec = Math.max(1, Math.ceil(((bucket + 1) * windowMs - now) / 1000));
  const store = counter();
  const count = Number(await store.incr(key));
  if (!Number.isFinite(count)) throw new RateLimitUnavailableError();
  await store.expire(key, ttlSec);
  if (count > max) {
    return { ok: false, retryAfterSec: ttlSec };
  }
  return { ok: true, retryAfterSec: 0 };
}

export async function limitContactIp(
  request: Request,
  now = Date.now(),
): Promise<RateLimitResult> {
  const ip = trustedClientAddress(request);
  if (!ip) {
    if (!process.env.VERCEL) return { ok: true, retryAfterSec: 0 };
    return hit("ip:unverified", CONTACT_LIMITS.ip.max, CONTACT_LIMITS.ip.windowSec, now);
  }
  return hit(
    `ip:${digest(ip)}`,
    CONTACT_LIMITS.ip.max,
    CONTACT_LIMITS.ip.windowSec,
    now,
  );
}

export async function limitContactEmail(
  email: string,
  now = Date.now(),
): Promise<RateLimitResult> {
  return hit(
    `email:${digest(email)}`,
    CONTACT_LIMITS.email.max,
    CONTACT_LIMITS.email.windowSec,
    now,
  );
}

export function resetRateLimitForTests() {
  memoryBuckets.clear();
  redisClient = null;
}
