import {
  buildContactEmail,
  DEFAULT_FROM,
  isHoneypotFilled,
  normalizeEmail,
  parseContactFields,
  parseFromAddress,
} from "@/lib/contact-message";
import {
  limitContactEmail,
  limitContactIp,
  RateLimitUnavailableError,
  trustedClientAddress,
} from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const DIRECT_EMAIL = "contact@jennifervoyages.fr";

function jsonError(error: string, status: number, retryAfterSec?: number) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: retryAfterSec
        ? { "Retry-After": String(retryAfterSec) }
        : undefined,
    },
  );
}

function unavailable() {
  return jsonError(
    `L’envoi est temporairement indisponible. Réessayez plus tard, ou écrivez à ${DIRECT_EMAIL}.`,
    503,
  );
}

export async function POST(request: Request) {
  let ipLimit: Awaited<ReturnType<typeof limitContactIp>>;
  try {
    ipLimit = await limitContactIp(request);
  } catch (error) {
    if (error instanceof RateLimitUnavailableError) {
      console.error("[contact] Redis absent sur Vercel");
    } else {
      console.error("[contact] limitation", error);
    }
    return unavailable();
  }
  if (!ipLimit.ok) {
    return jsonError(
      `Trop de messages envoyés. Réessayez dans quelques minutes, ou écrivez à ${DIRECT_EMAIL}.`,
      429,
      ipLimit.retryAfterSec,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Requête invalide.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Requête invalide.", 400);
  }
  const record = body as Record<string, unknown>;

  if (isHoneypotFilled(record.website)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseContactFields(record);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const turnstile = await verifyTurnstile({
    token: parsed.value.turnstileToken,
    remoteIp: trustedClientAddress(request),
  });
  if (!turnstile.ok) {
    return jsonError(
      turnstile.status === 503
        ? `La vérification anti-robot est momentanément indisponible. Réessayez dans un instant, ou écrivez à ${DIRECT_EMAIL}.`
        : "La vérification anti-robot n’a pas abouti. Réessayez.",
      turnstile.status,
    );
  }

  let emailLimit: Awaited<ReturnType<typeof limitContactEmail>>;
  try {
    emailLimit = await limitContactEmail(parsed.value.email);
  } catch (error) {
    console.error("[contact] limitation email", error);
    return unavailable();
  }
  if (!emailLimit.ok) {
    return jsonError(
      `Trop de messages envoyés. Réessayez dans quelques minutes, ou écrivez à ${DIRECT_EMAIL}.`,
      429,
      emailLimit.retryAfterSec,
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = parseFromAddress(
    process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
  );
  const to = normalizeEmail(process.env.CONTACT_TO_EMAIL?.trim() || DIRECT_EMAIL);
  if (!apiKey || !from.ok || !to) {
    console.error("[contact] expéditeur, destinataire ou clé Resend invalide");
    return unavailable();
  }

  const mail = buildContactEmail(parsed.value);
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: from.value,
    to: [to],
    replyTo: parsed.value.email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });

  if (error) {
    console.error("[contact] Resend:", error);
    return jsonError(
      "L’envoi a échoué. Réessayez ou utilisez l’email direct.",
      502,
    );
  }

  return NextResponse.json({ ok: true });
}
