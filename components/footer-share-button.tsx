"use client";

import { SITE, whatsappHref } from "@/lib/site";
import { Mail, MessageCircle, Phone, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const SHARE_TEXT =
  "Découvrez Jennifer & Voyages, votre Voyage Planner sur mesure.";

type ToastState = "idle" | "copied" | "error";

const PLACEHOLDER_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white shadow-sm";

const BUTTON_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white p-0 text-muted shadow-sm transition-[background-color,border-color,color,box-shadow] hover:border-brand-primary/25 hover:bg-brand-primary/10 hover:text-brand-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40";

/**
 * Partage natif (navigator.share) ou copie du lien + toast.
 */
export function FooterShareButton() {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<ToastState>("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (toast === "idle") return;
    const t = window.setTimeout(() => setToast("idle"), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const copyUrlFallback = useCallback(async () => {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      setToast("copied");
    } catch {
      setToast("error");
    }
  }, []);

  const onClick = useCallback(async () => {
    const url = window.location.origin;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Jennifer & Voyages",
          text: SHARE_TEXT,
          url,
        });
        return;
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
    }
    await copyUrlFallback();
  }, [copyUrlFallback]);

  if (!mounted) {
    return <span className={PLACEHOLDER_CLASS} aria-hidden tabIndex={-1} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={BUTTON_CLASS}
        aria-label="Partager le site"
        title="Partager"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
      </button>
      {toast !== "idle"
        ? createPortal(
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none fixed bottom-6 left-1/2 z-[100] max-w-[min(90vw,20rem)] -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2.5 text-center text-sm text-foreground shadow-lg ring-1 ring-black/5"
            >
              {toast === "copied" ? (
                <>Lien copié dans le presse-papiers.</>
              ) : (
                <>
                  Impossible de copier automatiquement. Sélectionnez l’adresse
                  dans la barre du navigateur.
                </>
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function FooterMessageLink() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const href = whatsappHref();

  if (!mounted) {
    return <span className={PLACEHOLDER_CLASS} aria-hidden tabIndex={-1} />;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={BUTTON_CLASS}
      aria-label="Ouvrir une conversation WhatsApp"
      title="WhatsApp"
    >
      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

export function FooterEmailLink() {
  return (
    <a
      href={`mailto:${SITE.email}`}
      className={BUTTON_CLASS}
      aria-label="Envoyer un email"
      title="Email"
    >
      <Mail className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

export function FooterPhoneLink() {
  return (
    <a
      href={`tel:+${SITE.phoneE164}`}
      className={BUTTON_CLASS}
      aria-label="Appeler par téléphone"
      title="Téléphone"
    >
      <Phone className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

export function FooterInstagramLink() {
  return (
    <a
      href={SITE.instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={BUTTON_CLASS}
      aria-label="Ouvrir le profil Instagram"
      title="Instagram"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    </a>
  );
}
