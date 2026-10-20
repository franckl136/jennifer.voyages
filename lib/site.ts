/** Présentation longue : hors des carnets, uniquement via le bouton « Qui suis-je ? ». */
export const PROFILE_POST_SLUG = "quelques-mots-sur-moi";

export const SITE = {
  name: "Jennifer & Voyages",
  email: "contact@jennifervoyages.fr",
  phoneE164: "33632879873",
  phoneDisplay: "06 32 87 98 73",
  instagramUrl: "https://www.instagram.com/jennifer.voyages/",
} as const;

export function whatsappHref() {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? SITE.phoneE164;
  return `https://wa.me/${String(raw).replace(/\D/g, "")}`;
}
