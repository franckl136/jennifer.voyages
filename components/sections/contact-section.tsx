"use client";

import { SITE, whatsappHref } from "@/lib/site";
import { Phone, Send } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

const fieldClass =
  "w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none ring-foreground/10 placeholder:text-muted focus:ring-2 disabled:opacity-60";

type Status = "idle" | "loading" | "success" | "error";

export function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          destination: data.get("destination"),
          message: data.get("message"),
          privacy: data.get("privacy") === "on",
          website: data.get("website"),
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          payload.error ||
            "Une erreur est survenue. Réessayez ou écrivez à contact@jennifervoyages.fr.",
        );
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg(
        "Impossible d’envoyer le message. Vérifiez votre connexion ou utilisez l’email.",
      );
    }
  }

  return (
    <section
      id="contact"
      className="border-t border-border bg-pastel-mist/25 py-10 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-sky">
            Contact
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Parlons de votre prochain voyage
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Décrivez votre envie en quelques lignes : je vous réponds pour
            échanger sur la faisabilité et la suite ensemble.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <a
              href={`tel:+${SITE.phoneE164}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-pastel-mist/60"
              aria-label="Appeler par téléphone"
            >
              <Phone className="h-4 w-4 text-accent-sky" aria-hidden />
              Téléphone
            </a>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-pastel-mist/60"
            >
              WhatsApp
            </a>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-pastel-mist/60"
            >
              Instagram
            </a>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative mx-auto mt-12 max-w-xl space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          {/* Honeypot — laisser vide */}
          <div className="sr-only" aria-hidden>
            <label htmlFor="contact-website">Site web</label>
            <input
              id="contact-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="contact-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Nom
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              maxLength={120}
              disabled={status === "loading"}
              className={fieldClass}
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              disabled={status === "loading"}
              className={fieldClass}
              placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <label
              htmlFor="contact-destination"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Destination souhaitée
            </label>
            <input
              id="contact-destination"
              name="destination"
              type="text"
              required
              maxLength={200}
              disabled={status === "loading"}
              className={fieldClass}
              placeholder="Portugal, Japon, route aux États-Unis…"
            />
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              maxLength={5000}
              disabled={status === "loading"}
              className={`${fieldClass} resize-y`}
              placeholder="Dates envisagées, nombre de voyageurs, envies…"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <input
              id="contact-privacy"
              name="privacy"
              type="checkbox"
              required
              disabled={status === "loading"}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-brand-primary focus:ring-brand-primary disabled:opacity-60"
            />
            <div className="text-sm leading-relaxed text-foreground">
              <label htmlFor="contact-privacy" className="cursor-pointer">
                J&apos;accepte que mes données soient traitées conformément à la{" "}
              </label>
              <Link
                href="/mentions-legales#confidentialite"
                className="font-medium text-brand-primary underline underline-offset-2 hover:opacity-90"
              >
                politique de confidentialité
              </Link>
              .
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[16rem] sm:px-10"
            >
              <Send className="h-4 w-4" aria-hidden />
              {status === "loading" ? "Envoi…" : "Envoyer le message"}
            </button>
          </div>
          {status === "success" ? (
            <p className="text-center text-sm text-accent-mint" role="status">
              Merci ! Votre message a bien été envoyé. Je vous réponds dès que
              possible.
            </p>
          ) : null}
          {status === "error" ? (
            <p className="text-center text-sm text-accent-coral" role="alert">
              {errorMsg}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
