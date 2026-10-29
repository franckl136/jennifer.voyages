import { describe, expect, it } from "vitest";

import {
  containsBlockedLanguage,
  normalizeForLanguageScan,
} from "./contact-language";
import { parseContactFields } from "./contact-message";

const validBody = {
  name: "Camille Martin",
  email: "camille@example.com",
  destination: "Portugal",
  message: "Nous serions quatre, en juin.",
  privacy: true,
  source: "header",
  turnstileToken: "token",
};

describe("filtre de langage", () => {
  it("normalise accents et séparateurs", () => {
    expect(normalizeForLanguageScan("Cönnàrd!!!")).toContain("connard");
  });

  it("détecte une injure et ignore une phrase normale", () => {
    expect(containsBlockedLanguage("Quel connard celui-là")).toBe(true);
    expect(containsBlockedLanguage("c0nnard")).toBe(true);
    expect(containsBlockedLanguage("Quelle conne")).toBe(true);
    expect(containsBlockedLanguage("espèce de con")).toBe(true);
    expect(containsBlockedLanguage("Nous partons content au Portugal")).toBe(
      false,
    );
    expect(containsBlockedLanguage("voyage contre le stress")).toBe(false);
  });

  it("détecte une locution et un propos explicite", () => {
    expect(containsBlockedLanguage("ferme ta gueule")).toBe(true);
    expect(containsBlockedLanguage("lien porno à éviter")).toBe(true);
  });

  it("rejette le message au parse serveur", () => {
    const parsed = parseContactFields({
      ...validBody,
      message: "Espèce de connard, rappelle-moi.",
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toMatch(/propos qui ne peuvent pas être envoyés/i);
    }
  });

  it("accepte un message légitime", () => {
    expect(parseContactFields(validBody).ok).toBe(true);
  });
});
