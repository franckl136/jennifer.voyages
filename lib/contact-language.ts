/**
 * Filtre lexical simple pour le formulaire de contact.
 * Ne remplace pas une modération humaine : limite les insultes et propos explicites
 * les plus courants, avec normalisation (accents, caractères séparateurs).
 */

export const ERR_LANGUAGE =
  "Votre message contient des propos qui ne peuvent pas être envoyés. Merci de reformuler.";

/** Locutions (évite les faux positifs des mots trop courts). */
const BLOCKED_PHRASES = [
  "fils de pute",
  "fille de pute",
  "fils de putain",
  "va te faire foutre",
  "va niquer",
  "nique ta",
  "niquez vos",
  "ferme ta gueule",
  "ta gueule",
  "trou du cul",
  "sale pute",
  "fils de chien",
] as const;

/** Mots entiers uniquement (frontières hors lettres/chiffres). */
const BLOCKED_WORDS = [
  "con",
  "cons",
  "conne",
  "connes",
  "connard",
  "connards",
  "connasse",
  "connasses",
  "salope",
  "salopes",
  "salopard",
  "salopards",
  "putain",
  "putains",
  "pute",
  "putes",
  "encule",
  "enculee",
  "encules",
  "enculees",
  "enculer",
  "niquer",
  "nique",
  "ntm",
  "fdp",
  "bite",
  "bites",
  "couille",
  "couilles",
  "couillon",
  "couillons",
  "branleur",
  "branleurs",
  "branleuse",
  "branlette",
  "enfoire",
  "enfoires",
  "enfoiree",
  "enfoirees",
  "batard",
  "batarde",
  "batards",
  "batardes",
  "petasse",
  "petasses",
  "pouffiasse",
  "pouffiasses",
  "garce",
  "garces",
  "ordure",
  "ordures",
  "tocard",
  "tocarde",
  "racaille",
  "racailles",
  "negro",
  "negros",
  "negresse",
  "negresses",
  "bougnoule",
  "bougnoules",
  "youpin",
  "youpins",
  "fuck",
  "fucking",
  "fucker",
  "shit",
  "asshole",
  "assholes",
  "bitch",
  "bitches",
  "motherfucker",
  "cunt",
  "slut",
  "whore",
  "porno",
  "xxx",
  "pedo",
  "pedophile",
  "pedophilie",
  "zoophilie",
] as const;

function foldDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

/** Uniformise le texte pour la comparaison. */
export function normalizeForLanguageScan(value: string): string {
  return foldDiacritics(value)
    .toLowerCase()
    .replace(/['’`´]/g, " ")
    .replace(/[@4]/g, "a")
    .replace(/[€3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasBlockedWord(normalized: string, word: string): boolean {
  const target = normalizeForLanguageScan(word);
  if (!target) return false;
  const re = new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(target)}([^a-z0-9]|$)`,
    "i",
  );
  return re.test(` ${normalized} `);
}

export function containsBlockedLanguage(...parts: string[]): boolean {
  const normalized = normalizeForLanguageScan(parts.filter(Boolean).join(" "));
  if (!normalized) return false;

  for (const phrase of BLOCKED_PHRASES) {
    if (normalized.includes(normalizeForLanguageScan(phrase))) return true;
  }
  for (const word of BLOCKED_WORDS) {
    if (hasBlockedWord(normalized, word)) return true;
  }
  return false;
}
