import { clientAddress, rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const MAX_LEN = {
  name: 120,
  email: 254,
  destination: 200,
  message: 5000,
} as const;

function trimStr(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const limit = rateLimit(`contact:${clientAddress(request)}`);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error:
          "Trop de messages envoyés. Réessayez dans quelques minutes, ou écrivez à contact@jennifervoyages.fr.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  // Honeypot anti-bot (champ invisible)
  if (trimStr(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = trimStr(body.name, MAX_LEN.name);
  const email = trimStr(body.email, MAX_LEN.email);
  const destination = trimStr(body.destination, MAX_LEN.destination);
  const message = trimStr(body.message, MAX_LEN.message);
  const source = trimStr(body.source, 80) || "inconnu";
  const privacy = Boolean(body.privacy);

  if (!name || !email || !destination || !message || !privacy) {
    return NextResponse.json(
      { error: "Merci de remplir tous les champs obligatoires." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to =
    process.env.CONTACT_TO_EMAIL?.trim() || "contact@jennifervoyages.fr";
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Jennifer & Voyages <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY manquant");
    return NextResponse.json(
      {
        error:
          "L’envoi n’est pas encore configuré. Écrivez-moi à contact@jennifervoyages.fr.",
      },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const subject = `[Contact] ${destination} — ${name}`;
  const text = [
    `Nom : ${name}`,
    `Email : ${email}`,
    `Destination : ${destination}`,
    `Provenance : ${source}`,
    "",
    "Message :",
    message,
  ].join("\n");

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject,
    text,
  });

  if (error) {
    console.error("[contact] Resend:", error);
    return NextResponse.json(
      { error: "L’envoi a échoué. Réessayez ou utilisez l’email direct." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
