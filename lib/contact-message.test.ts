import { describe, expect, it } from "vitest";

import {
  LINK_WARNING,
  buildContactEmail,
  findUrls,
  normalizeEmail,
  parseContactFields,
  parseFromAddress,
} from "./contact-message";

const validBody = {
  name: "Camille Martin",
  email: "Camille@Example.com",
  destination: "Portugal",
  message: "Nous serions quatre, en juin.",
  privacy: true,
  source: "header",
  turnstileToken: "token",
};

describe("adresses email", () => {
  it("normalise une adresse valide", () => {
    expect(normalizeEmail("  Camille@Example.COM ")).toBe("camille@example.com");
  });

  it("rejette une adresse malformée ou une injection d’en-tête", () => {
    expect(normalizeEmail("pas-un-email")).toBeNull();
    expect(normalizeEmail("a@b")).toBeNull();
    expect(normalizeEmail("a@b.c")).toBeNull();
    expect(normalizeEmail("camille@example.com,autre@example.com")).toBeNull();
    expect(normalizeEmail("camille@example.com\r\nBcc: evil@example.com")).toBeNull();
    expect(normalizeEmail("camille@example.com\nBcc: evil@example.com")).toBeNull();
  });

  it("n’accepte un expéditeur que sur le domaine du site", () => {
    expect(
      parseFromAddress("Jennifer & Voyages <contact@jennifervoyages.fr>").ok,
    ).toBe(true);
    expect(parseFromAddress("Jennifer & Voyages <onboarding@resend.dev>").ok).toBe(
      false,
    );
    expect(
      parseFromAddress("Jennifer <contact@jennifervoyages.fr>\r\nBcc: evil@x.com")
        .ok,
    ).toBe(false);
  });
});

describe("champs du formulaire", () => {
  it("accepte une saisie légitime et normalise l’email", () => {
    const parsed = parseContactFields(validBody);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value.email).toBe("camille@example.com");
  });

  it("rejette une case confidentialité qui n’est pas le booléen true", () => {
    expect(parseContactFields({ ...validBody, privacy: "true" }).ok).toBe(false);
    expect(parseContactFields({ ...validBody, privacy: "on" }).ok).toBe(false);
  });

  it("rejette un champ trop long et une injection dans le nom", () => {
    expect(
      parseContactFields({ ...validBody, message: "a".repeat(5001) }).ok,
    ).toBe(false);
    const injected = parseContactFields({
      ...validBody,
      name: "Jean\r\nBcc: evil@example.com",
    });
    expect(injected.ok).toBe(false);
  });

  it("ignore une provenance malformée", () => {
    const parsed = parseContactFields({
      ...validBody,
      source: "header\r\nBcc: evil@example.com",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value.source).toBe("inconnu");
  });
});

describe("liens", () => {
  it("détecte http, https, www et un domaine sans préfixe", () => {
    const hits = findUrls(
      "Voir https://hotel.example/a, http://autre.example/b, www.site.example/c et agence.example/d. Écrire à contact@example.com. Fichier photo.jpg.",
    );
    expect(hits.map((hit) => hit.raw)).toEqual([
      "https://hotel.example/a",
      "http://autre.example/b",
      "www.site.example/c",
      "agence.example/d",
    ]);
  });

  it("repère une adresse IP sans conclure à un domaine malveillant", () => {
    const [hit] = findUrls("Connexion https://203.0.113.8/login");
    expect(hit?.flags).toContain("ip");
  });

  it("affiche un avertissement et rend le lien non cliquable", () => {
    const mail = buildContactEmail({
      ...validBody,
      email: "camille@example.com",
      message: "L’hôtel : https://hotel.example/chambre",
    });
    expect(mail.linkCount).toBe(1);
    expect(mail.text).toContain(LINK_WARNING);
    expect(mail.text).toContain("https://hotel[.]example/chambre");
    expect(mail.text).not.toContain("https://hotel.example/chambre");
    expect(mail.html).not.toContain("https://hotel.example/chambre");
    expect(mail.html).not.toMatch(/<a[\s>]/i);
    expect(mail.html).not.toContain("href=");
  });

  it("signale plusieurs liens et échappe le HTML", () => {
    const mail = buildContactEmail({
      ...validBody,
      email: "camille@example.com",
      message:
        'Voir https://un.example/a et www.deux.example/b puis trois.example/c <script>alert("x")</script>',
    });
    expect(mail.linkCount).toBe(3);
    expect(mail.text).toContain("3 liens détectés");
    expect(mail.text).toContain("Ceci n’est pas un verdict de malveillance.");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.html).not.toContain("<script>");
  });

  it("n’ajoute pas d’avertissement sans lien", () => {
    const mail = buildContactEmail({
      ...validBody,
      email: "camille@example.com",
    });
    expect(mail.linkCount).toBe(0);
    expect(mail.text).not.toContain("ATTENTION");
    expect(mail.subject).toBe("[Contact] Portugal — Camille Martin");
  });
});
