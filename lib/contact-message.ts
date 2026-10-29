/** Limites alignées sur les attributs maxLength du formulaire. */
export const CONTACT_FIELD_MAX = {
  name: 120,
  email: 254,
  destination: 200,
  message: 5000,
} as const;

export const MAIL_DOMAIN = "jennifervoyages.fr";

export const DEFAULT_FROM = `Jennifer & Voyages <contact@${MAIL_DOMAIN}>`;

export const LINK_WARNING =
  "ATTENTION : ce message contient un ou plusieurs liens externes. Vérifiez leur destination avant de les ouvrir.";

const ERR_INVALID = "Requête invalide.";
const ERR_REQUIRED = "Merci de remplir tous les champs obligatoires.";
const ERR_EMAIL = "Adresse email invalide.";
const ERR_CHARS = "Certains champs contiennent des caractères non autorisés.";
const ERR_LENGTH = "Un champ dépasse la longueur autorisée.";

const SINGLE_LINE_FORBIDDEN = /[\u0000-\u001F\u007F\u2028\u2029]/;
const MESSAGE_UNSAFE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029]/;

const EMAIL_RE =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

const SOURCE_RE = /^[a-z0-9-]{1,40}$/;

const FILE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "pdf",
  "css",
  "js",
  "mjs",
  "mp4",
  "mp3",
  "zip",
  "txt",
  "doc",
  "docx",
  "heic",
  "avif",
]);

const URL_RE =
  /\b(?:(?:https?:\/\/|www\.)[^\s<>"'`()[\]{}]+|(?<![@\w])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])\.)+[a-z]{2,24}(?:\/[^\s<>"'`()[\]{}]*)?)/gi;

const TRAILING_PUNCTUATION = /[.,;:!?)]+$/;

export type UrlFlag = "ip" | "punycode" | "credentials" | "long" | "subdomains";

export type UrlHit = {
  raw: string;
  host: string;
  flags: UrlFlag[];
};

export type ContactFields = {
  name: string;
  email: string;
  destination: string;
  message: string;
  source: string;
  turnstileToken: string;
};

export function isHoneypotFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (SINGLE_LINE_FORBIDDEN.test(email) || /[<>(),;\\\s]/.test(email)) {
    return null;
  }
  if (email.length === 0 || email.length > CONTACT_FIELD_MAX.email) return null;
  if (!EMAIL_RE.test(email)) return null;
  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (
    !local ||
    !domain ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..") ||
    domain.startsWith("-") ||
    domain.endsWith("-") ||
    domain.includes("..")
  ) {
    return null;
  }
  const tld = domain.split(".").at(-1) ?? "";
  if (!/^[a-z]{2,24}$/.test(tld)) return null;
  return email;
}

export function parseFromAddress(
  raw: string,
): { ok: true; value: string } | { ok: false } {
  const value = raw.trim();
  if (!value || SINGLE_LINE_FORBIDDEN.test(value)) return { ok: false };
  const wrapped = value.match(/^(.*?)<([^<>]+)>$/);
  const display = wrapped ? wrapped[1].trim() : "";
  const address = (wrapped ? wrapped[2] : value).trim();
  if (display && /[<>"]/.test(display)) return { ok: false };
  const email = normalizeEmail(address);
  if (!email) return { ok: false };
  const domain = email.slice(email.lastIndexOf("@") + 1);
  if (domain !== MAIL_DOMAIN && !domain.endsWith(`.${MAIL_DOMAIN}`)) {
    return { ok: false };
  }
  return { ok: true, value: display ? `${display} <${email}>` : email };
}

function readLimited(
  value: unknown,
  max: number,
  allowNewlines: boolean,
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string") return { ok: false, error: ERR_INVALID };
  const trimmed = value.trim();
  if (trimmed.length > max) return { ok: false, error: ERR_LENGTH };
  if ((allowNewlines ? MESSAGE_UNSAFE : SINGLE_LINE_FORBIDDEN).test(trimmed)) {
    return { ok: false, error: ERR_CHARS };
  }
  return { ok: true, value: trimmed };
}

export function parseContactFields(
  body: Record<string, unknown>,
): { ok: true; value: ContactFields } | { ok: false; error: string } {
  const name = readLimited(body.name, CONTACT_FIELD_MAX.name, false);
  if (!name.ok) return name;
  const emailRaw = readLimited(body.email, CONTACT_FIELD_MAX.email, false);
  if (!emailRaw.ok) return emailRaw;
  const destination = readLimited(
    body.destination,
    CONTACT_FIELD_MAX.destination,
    false,
  );
  if (!destination.ok) return destination;
  const message = readLimited(body.message, CONTACT_FIELD_MAX.message, true);
  if (!message.ok) return message;

  if (!name.value || !emailRaw.value || !destination.value || !message.value) {
    return { ok: false, error: ERR_REQUIRED };
  }
  if (body.privacy !== true) return { ok: false, error: ERR_REQUIRED };

  const email = normalizeEmail(emailRaw.value);
  if (!email) return { ok: false, error: ERR_EMAIL };

  const sourceRaw = typeof body.source === "string" ? body.source.trim() : "";
  const source = SOURCE_RE.test(sourceRaw) ? sourceRaw : "inconnu";
  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : "";

  return {
    ok: true,
    value: {
      name: name.value,
      email,
      destination: destination.value,
      message: message.value,
      source,
      turnstileToken,
    },
  };
}

function extractHost(raw: string): string | null {
  const withoutScheme = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  const authority = withoutScheme.split(/[/?#]/)[0] ?? "";
  if (!authority) return null;
  const hostport = authority.includes("@")
    ? authority.slice(authority.lastIndexOf("@") + 1)
    : authority;
  if (hostport.startsWith("[")) {
    const end = hostport.indexOf("]");
    return end > 1 ? hostport.slice(1, end) : null;
  }
  return hostport.replace(/:\d+$/, "") || null;
}

function flagsFor(raw: string, host: string): UrlFlag[] {
  const flags: UrlFlag[] = [];
  const hostname = host.toLowerCase();
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":")) {
    flags.push("ip");
  }
  if (hostname.includes("xn--")) flags.push("punycode");
  const authority = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").split(/[/?#]/)[0] ?? "";
  if (authority.includes("@")) flags.push("credentials");
  if (raw.length > 200) flags.push("long");
  if (hostname.split(".").filter(Boolean).length >= 5) flags.push("subdomains");
  return flags;
}

function isBareFileName(raw: string): boolean {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) || raw.includes("/")) return false;
  const host = extractHost(raw)?.toLowerCase() ?? "";
  const tld = host.split(".").at(-1) ?? "";
  return FILE_EXT.has(tld);
}

export function findUrls(text: string): UrlHit[] {
  const hits: UrlHit[] = [];
  for (const match of text.matchAll(URL_RE)) {
    const raw = match[0].replace(TRAILING_PUNCTUATION, "");
    if (!raw || isBareFileName(raw)) continue;
    const host = extractHost(raw);
    if (!host || !host.includes(".")) continue;
    hits.push({ raw, host, flags: flagsFor(raw, host) });
  }
  return hits;
}

export function defangUrl(raw: string): string {
  const match = raw.match(/^([a-z][a-z0-9+.-]*:\/\/)?([^/?#]+)(.*)$/i);
  if (!match) return raw.replaceAll(".", "[.]");
  const scheme = match[1] ?? "";
  let authority = match[2] ?? "";
  const rest = match[3] ?? "";
  const at = authority.lastIndexOf("@");
  const userinfo = at >= 0 ? authority.slice(0, at + 1) : "";
  if (at >= 0) authority = authority.slice(at + 1);
  return `${scheme}${userinfo}${authority.replaceAll(".", "[.]")}${rest}`;
}

export function defangUserText(text: string): string {
  const urls = [...findUrls(text)].sort((a, b) => b.raw.length - a.raw.length);
  let out = text;
  for (const url of urls) {
    out = out.split(url.raw).join(defangUrl(url.raw));
  }
  return out;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const FLAG_NOTES: Record<UrlFlag, string> = {
  ip: "un lien utilise une adresse IP",
  punycode: "un lien utilise un domaine internationalisé (punycode)",
  credentials: "un lien contient des identifiants dans l’adresse",
  long: "un lien est inhabituellement long",
  subdomains: "un lien comporte de nombreux sous-domaines",
};

export function buildContactEmail(input: ContactFields): {
  subject: string;
  text: string;
  html: string;
  linkCount: number;
} {
  const name = defangUserText(input.name);
  const destination = defangUserText(input.destination);
  const message = defangUserText(input.message);
  const urls = findUrls(
    [input.name, input.destination, input.message].join("\n"),
  );

  let subject = `[Contact] ${destination} — ${name}`;
  if (subject.length > 180) subject = `${subject.slice(0, 179)}…`;

  const lines = [
    `Nom : ${name}`,
    `Email : ${input.email}`,
    `Destination : ${destination}`,
    `Provenance : ${input.source}`,
    "",
    "Message :",
    message,
  ];

  const notes: string[] = [];
  if (urls.length >= 2) notes.push(`${urls.length} liens détectés`);
  for (const flag of new Set(urls.flatMap((url) => url.flags))) {
    notes.push(FLAG_NOTES[flag]);
  }

  const banner: string[] = [];
  if (urls.length > 0) {
    banner.push(
      LINK_WARNING,
      `Liens détectés : ${urls.length}.`,
      "Les points des noms de domaine sont écrits [.] pour que l’adresse reste lisible sans devenir un lien cliquable. Ce repérage ne signifie pas qu’un domaine est malveillant.",
    );
    if (notes.length > 0) {
      banner.push(
        `Signalement automatique : ${notes.join(" ; ")}. Ceci n’est pas un verdict de malveillance.`,
      );
    }
    banner.push("");
  }

  const text = [...banner, ...lines].join("\n");
  const warningHtml =
    urls.length === 0
      ? ""
      : `<div style="margin:0 0 16px;padding:12px 14px;background:#fff4d6;border:1px solid #e2c56a;font-family:sans-serif;font-size:15px;line-height:1.45">
<p style="margin:0 0 8px;font-weight:700">${escapeHtml(LINK_WARNING)}</p>
<p style="margin:0">Liens détectés : ${urls.length}. Les points des noms de domaine sont écrits [.] pour éviter un clic accidentel. Ce repérage ne signifie pas qu’un domaine est malveillant.</p>
${
  notes.length > 0
    ? `<p style="margin:8px 0 0">Signalement automatique : ${escapeHtml(notes.join(" ; "))}.</p>`
    : ""
}
</div>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#1a2a3d">
${warningHtml}
<p><strong>Nom :</strong> ${escapeHtml(name)}</p>
<p><strong>Email :</strong> ${escapeHtml(input.email)}</p>
<p><strong>Destination :</strong> ${escapeHtml(destination)}</p>
<p><strong>Provenance :</strong> ${escapeHtml(input.source)}</p>
<p><strong>Message :</strong></p>
<pre style="white-space:pre-wrap;font-family:sans-serif;font-size:15px">${escapeHtml(message)}</pre>
</body>
</html>`;

  return { subject, text, html, linkCount: urls.length };
}
