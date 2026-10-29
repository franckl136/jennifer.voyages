import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

import { CONTACT_LIMITS, resetRateLimitForTests } from "@/lib/rate-limit";
import { LINK_WARNING } from "@/lib/contact-message";
import { POST } from "./route";

const envKeys = [
  "RESEND_API_KEY",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "TURNSTILE_ALLOWED_HOSTNAMES",
  "VERCEL",
  "VERCEL_ENV",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
] as const;

let snapshot: Partial<Record<(typeof envKeys)[number], string | undefined>> = {};

const passedChallenge = {
  success: true,
  hostname: "jennifervoyages.fr",
  action: "contact",
  "error-codes": [],
};

beforeEach(() => {
  snapshot = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  process.env.RESEND_API_KEY = "re_test";
  process.env.CONTACT_FROM_EMAIL =
    "Jennifer & Voyages <contact@jennifervoyages.fr>";
  process.env.CONTACT_TO_EMAIL = "contact@jennifervoyages.fr";
  process.env.TURNSTILE_SECRET_KEY = "turnstile-secret";
  process.env.NEXT_PUBLIC_SITE_URL = "https://jennifervoyages.fr";
  process.env.VERCEL_ENV = "production";
  delete process.env.VERCEL;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.TURNSTILE_ALLOWED_HOSTNAMES;
  resetRateLimitForTests();
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(passedChallenge)),
  );
});

afterEach(() => {
  for (const key of envKeys) {
    if (snapshot[key] === undefined) delete process.env[key];
    else process.env[key] = snapshot[key];
  }
  vi.unstubAllGlobals();
  resetRateLimitForTests();
});

function contactRequest(
  body: Record<string, unknown> = {},
  headers: Record<string, string | null> = {},
) {
  const finalHeaders = new Headers({
    "content-type": "application/json",
    "x-vercel-forwarded-for": "203.0.113.10",
  });
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) finalHeaders.delete(key);
    else finalHeaders.set(key, value);
  }
  return new Request("https://jennifervoyages.fr/api/contact", {
    method: "POST",
    headers: finalHeaders,
    body: JSON.stringify({
      name: "Camille Martin",
      email: "camille@example.com",
      destination: "Portugal",
      message: "Nous serions quatre, en juin.",
      privacy: true,
      website: "",
      source: "header",
      turnstileToken: "token-ok",
      ...body,
    }),
  });
}

describe("POST /api/contact", () => {
  it("envoie un message légitime avec un expéditeur du domaine", async () => {
    const response = await POST(contactRequest({ email: "Camille@Example.com" }));
    expect(response.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const mail = sendMock.mock.calls[0]?.[0];
    expect(mail.from).toBe("Jennifer & Voyages <contact@jennifervoyages.fr>");
    expect(mail.replyTo).toBe("camille@example.com");
    expect(mail.to).toEqual(["contact@jennifervoyages.fr"]);
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.text).toContain("Nous serions quatre, en juin.");
    expect(mail.text).not.toContain("ATTENTION");
  });

  it("rejette un appel direct sans jeton Turnstile", async () => {
    const response = await POST(contactRequest({ turnstileToken: "" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/anti-robot/i);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejette un jeton invalide ou déjà utilisé", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
      ),
    );
    const invalid = await POST(contactRequest());
    expect(invalid.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          success: false,
          "error-codes": ["timeout-or-duplicate"],
        }),
      ),
    );
    const reused = await POST(contactRequest({ turnstileToken: "reuse" }));
    expect(reused.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("ne transmet pas un honeypot renseigné", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("siteverify ne doit pas être appelé");
    }));
    const response = await POST(contactRequest({ website: "https://spam.example" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("limite les soumissions répétées d’une même source", async () => {
    for (let i = 0; i < CONTACT_LIMITS.ip.max; i += 1) {
      const response = await POST(contactRequest());
      expect(response.status).toBe(200);
    }
    const blocked = await POST(contactRequest());
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
    const body = await blocked.json();
    expect(body.error).toMatch(/Trop de messages/);
    expect(body.error).not.toMatch(/redis|upstash|stack/i);
    expect(sendMock).toHaveBeenCalledTimes(CONTACT_LIMITS.ip.max);
  });

  it("limite aussi la même adresse email depuis plusieurs IP", async () => {
    for (let i = 0; i < CONTACT_LIMITS.email.max; i += 1) {
      const response = await POST(
        contactRequest(
          {},
          { "x-vercel-forwarded-for": `203.0.113.${i + 1}` },
        ),
      );
      expect(response.status).toBe(200);
    }
    const blocked = await POST(
      contactRequest({}, { "x-vercel-forwarded-for": "203.0.113.50" }),
    );
    expect(blocked.status).toBe(429);
    expect(sendMock).toHaveBeenCalledTimes(CONTACT_LIMITS.email.max);
  });

  it("ignore une IP fournie seulement dans x-forwarded-for", async () => {
    for (let i = 0; i < CONTACT_LIMITS.ip.max + 1; i += 1) {
      const response = await POST(
        contactRequest(
          { email: `person${i}@example.com` },
          {
            "x-vercel-forwarded-for": null,
            "x-real-ip": null,
            "x-forwarded-for": "198.51.100.20",
          },
        ),
      );
      expect(response.status).toBe(200);
    }
  });

  it("ne laisse pas un x-forwarded-for variable contourner la limite plateforme", async () => {
    for (let i = 0; i < CONTACT_LIMITS.ip.max; i += 1) {
      const response = await POST(
        contactRequest(
          {},
          { "x-forwarded-for": `198.51.100.${i + 1}` },
        ),
      );
      expect(response.status).toBe(200);
    }
    const blocked = await POST(
      contactRequest({}, { "x-forwarded-for": "198.51.100.99" }),
    );
    expect(blocked.status).toBe(429);
  });

  it("rejette une adresse email malformée", async () => {
    const response = await POST(contactRequest({ email: "pas-un-email" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Adresse email invalide.",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejette une injection d’en-têtes", async () => {
    const byName = await POST(
      contactRequest({ name: "Jean\r\nBcc: evil@example.com" }),
    );
    const byEmail = await POST(
      contactRequest({ email: "camille@example.com\nBcc: evil@example.com" }),
    );
    expect(byName.status).toBe(400);
    expect(byEmail.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("transmet un lien légitime avec un avertissement non cliquable", async () => {
    const response = await POST(
      contactRequest({
        message: "Voici l’hôtel https://hotel.example/chambre",
      }),
    );
    expect(response.status).toBe(200);
    const mail = sendMock.mock.calls[0]?.[0];
    expect(mail.text).toContain(LINK_WARNING);
    expect(mail.text).toContain("https://hotel[.]example/chambre");
    expect(mail.text).not.toContain("https://hotel.example/chambre");
    expect(mail.html).not.toMatch(/<a[\s>]/i);
    expect(mail.replyTo).toBe("camille@example.com");
  });

  it("transmet plusieurs liens avec le décompte, sans les bloquer", async () => {
    const response = await POST(
      contactRequest({
        message:
          "Devis https://un.example/a et www.deux.example/b puis trois.example/c",
      }),
    );
    expect(response.status).toBe(200);
    const mail = sendMock.mock.calls[0]?.[0];
    expect(mail.text).toContain("Liens détectés : 3.");
    expect(mail.text).toContain("3 liens détectés");
    expect(mail.html).not.toContain("https://un.example/a");
  });

  it("échappe le HTML et refuse un contournement des contrôles du navigateur", async () => {
    const html = await POST(
      contactRequest({
        message: '<img src=x onerror="alert(1)"> https://evil.example/phish',
      }),
    );
    expect(html.status).toBe(200);
    const mail = sendMock.mock.calls[0]?.[0];
    expect(mail.html).toContain("&lt;img");
    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("evil[.]example");

    sendMock.mockClear();
    const checkbox = await POST(contactRequest({ privacy: "on" }));
    const oversized = await POST(
      contactRequest({ message: "a".repeat(5001) }),
    );
    expect(checkbox.status).toBe(400);
    expect(oversized.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("refuse d’envoyer si l’expéditeur n’est pas sur le domaine", async () => {
    process.env.CONTACT_FROM_EMAIL = "Jennifer & Voyages <onboarding@resend.dev>";
    const response = await POST(contactRequest());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).not.toMatch(/resend\.dev|CONTACT_FROM/i);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("n’accepte pas les envois sur Vercel tant que Redis n’est pas configuré", async () => {
    process.env.VERCEL = "1";
    const response = await POST(contactRequest());
    expect(response.status).toBe(503);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
