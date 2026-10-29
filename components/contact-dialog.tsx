"use client";

import { backLinkClass } from "@/lib/back-link";
import {
  lockBodyScroll,
  pinScrollBehavior,
  restoreWindowScroll,
} from "@/lib/scroll-lock";
import { SITE, whatsappHref } from "@/lib/site";
import { ArrowLeft, MessageCircle, Minus, Phone, Send, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const fieldClass =
  "w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none ring-foreground/10 placeholder:text-muted focus:ring-2 disabled:opacity-60";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          appearance?: "always" | "execute" | "interaction-only";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const CONTACT_EVENT = "jv-open-contact";

let suspendedScrollRestoration: ScrollRestoration | null = null;

/** Le retour historique ne doit pas réappliquer un scroll (souvent le bas de page). */
function suspendScrollRestoration() {
  if (!("scrollRestoration" in history)) return;
  if (suspendedScrollRestoration === null) {
    suspendedScrollRestoration = history.scrollRestoration;
  }
  history.scrollRestoration = "manual";
}

function resumeScrollRestoration() {
  if (!("scrollRestoration" in history)) return;
  if (suspendedScrollRestoration === null) return;
  history.scrollRestoration = suspendedScrollRestoration;
  suspendedScrollRestoration = null;
}

type Status = "idle" | "loading" | "success" | "error";

type ContactLinkProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  /** Origine du clic (header, footer, cta-bas-page…) pour le suivi. */
  source?: string;
};

/** Ouvre la fenêtre de contact sans changer de page (#contact). */
export function ContactLink({
  className,
  children,
  onClick,
  source = "lien",
}: ContactLinkProps) {
  return (
    <Link
      href="/#contact"
      scroll={false}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        window.dispatchEvent(
          new CustomEvent(CONTACT_EVENT, { detail: { source } }),
        );
      }}
    >
      {children}
    </Link>
  );
}

function formHasDraft(form: HTMLFormElement | null) {
  if (!form) return false;
  return ["name", "email", "destination", "message"].some((key) => {
    const field = form.elements.namedItem(key);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      return field.value.trim().length > 0;
    }
    return false;
  });
}

export function ContactDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pushedRef = useRef(false);
  const closingRef = useRef(false);
  const privacyOpenRef = useRef(false);
  const sourceRef = useRef("lien-direct");
  /** true seulement si le pointeur a commencé sur le fond (évite de fermer après une sélection de texte). */
  const backdropPointerDownRef = useRef(false);
  /** Position de la page au moment où l’on demande l’ouverture. */
  const scrollSnapshotRef = useRef(0);
  /** history.back() après le déverrouillage du scroll, pas pendant que le body est fixed. */
  const pendingHistoryBackRef = useRef(false);
  const lockEpochRef = useRef(0);
  const scrollFrameRef = useRef(0);
  const scrollTimerRef = useRef(0);
  const openRef = useRef(false);
  const titleId = useId();
  const pathname = usePathname();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef("");
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstilePassed, setTurnstilePassed] = useState(false);
  const privacyTitleId = useId();
  const confirmTitleId = useId();
  openRef.current = open;

  const rememberScroll = useCallback(() => {
    scrollSnapshotRef.current = window.scrollY;
  }, []);

  useEffect(() => {
    privacyOpenRef.current = privacyOpen;
  }, [privacyOpen]);

  const stripHash = useCallback(() => {
    if (window.location.hash !== "#contact") return;
    const base = window.location.pathname + window.location.search;
    if (pushedRef.current) {
      pushedRef.current = false;
      // Différé : history.back() pendant le body fixed renvoie en bas de page.
      pendingHistoryBackRef.current = true;
      return;
    }
    history.replaceState(null, "", base);
  }, []);

  const ensureHash = useCallback(() => {
    if (window.location.hash === "#contact") return;
    suspendScrollRestoration();
    const scrollY = scrollSnapshotRef.current;
    const next = `${window.location.pathname}${window.location.search}#contact`;
    history.pushState(null, "", next);
    restoreWindowScroll(scrollY);
    pushedRef.current = true;
  }, []);

  const expand = useCallback(() => {
    sourceRef.current = "fab-message";
    setMinimized(false);
    setPrivacyOpen(false);
    setConfirmDismiss(false);
    rememberScroll();
    ensureHash();
    setOpen(true);
  }, [ensureHash, rememberScroll]);

  const blurActiveField = useCallback(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  }, []);

  /** Réduit le formulaire : l’icône Message n’apparaît que s’il y a une saisie. */
  const minimize = useCallback(() => {
    blurActiveField();
    setPrivacyOpen(false);
    setConfirmDismiss(false);
    setMinimized(formHasDraft(formRef.current));
    stripHash();
    setOpen(false);
  }, [blurActiveField, stripHash]);

  const clearAndClose = useCallback(() => {
    blurActiveField();
    setPrivacyOpen(false);
    setConfirmDismiss(false);
    setMinimized(false);
    setStatus("idle");
    setErrorMsg("");
    formRef.current?.reset();
    stripHash();
    setOpen(false);
  }, [blurActiveField, stripHash]);

  /** Ferme tout et vide le formulaire (demande confirmation s’il y a une saisie). */
  const dismiss = useCallback(() => {
    blurActiveField();
    if (formHasDraft(formRef.current)) {
      setConfirmDismiss(true);
      return;
    }
    clearAndClose();
  }, [blurActiveField, clearAndClose]);

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#contact") {
        sourceRef.current = "lien-direct";
        setMinimized(false);
        rememberScroll();
        setOpen(true);
        return;
      }
      pushedRef.current = false;
      if (openRef.current) setOpen(false);
    };
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: string }>).detail;
      sourceRef.current = detail?.source?.trim() || "lien";
      setMinimized(false);
      rememberScroll();
      ensureHash();
      setOpen(true);
    };

    syncFromHash();
    window.addEventListener(CONTACT_EVENT, onRequest);
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener(CONTACT_EVENT, onRequest);
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, [ensureHash, rememberScroll]);

  useEffect(() => {
    if (window.location.hash === "#contact") return;
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) return;
    setPrivacyOpen(false);
    setConfirmDismiss(false);
  }, [open]);

  useLayoutEffect(() => {
    const el = dialogRef.current;
    if (!el || !open) return;

    closingRef.current = false;
    cancelAnimationFrame(scrollFrameRef.current);
    clearTimeout(scrollTimerRef.current);
    const epoch = ++lockEpochRef.current;
    const scrollY = scrollSnapshotRef.current;
    const releaseSmooth = pinScrollBehavior();
    suspendScrollRestoration();
    // overflow sur tactile : évite le décalage des taps iOS après fermeture clavier
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const unlock = lockBodyScroll({
      strategy: coarse ? "overflow" : "fixed",
      scrollY,
    });
    // Body déjà figé : showModal ne peut plus envoyer la page en haut.
    if (!el.open) el.showModal();
    if (coarse) restoreWindowScroll(scrollY);

    return () => {
      if (el.open) {
        closingRef.current = true;
        el.close();
      }
      unlock();
      restoreWindowScroll(scrollY);

      if (
        pendingHistoryBackRef.current &&
        window.location.hash === "#contact"
      ) {
        pendingHistoryBackRef.current = false;
        history.back();
        restoreWindowScroll(scrollY);
      } else {
        pendingHistoryBackRef.current = false;
      }

      releaseSmooth();
      const settle = () => {
        if (epoch !== lockEpochRef.current) return;
        restoreWindowScroll(scrollY);
      };
      scrollFrameRef.current = requestAnimationFrame(() => {
        settle();
        scrollTimerRef.current = window.setTimeout(() => {
          settle();
          if (epoch === lockEpochRef.current) resumeScrollRestoration();
        }, 0);
      });
    };
  }, [open]);

  // Autofocus clavier désactivé sur tactile (sinon impossible de fermer / cocher après).
  useEffect(() => {
    if (!open || privacyOpen) return;
    const el = dialogRef.current;
    if (!el?.open) return;
    el.scrollTop = 0;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;
    el.querySelector<HTMLInputElement>("#contact-name")?.focus({
      preventScroll: true,
    });
  }, [open, privacyOpen]);

  useEffect(() => {
    if (!open || !privacyOpen) return;
    dialogRef.current
      ?.querySelector<HTMLButtonElement>("#contact-privacy-back")
      ?.focus({ preventScroll: true });
  }, [open, privacyOpen]);

  function resetTurnstile() {
    tokenRef.current = "";
    setTurnstilePassed(false);
    const id = widgetIdRef.current;
    if (id && window.turnstile) window.turnstile.reset(id);
  }

  useEffect(() => {
    if (!open || !TURNSTILE_SITE_KEY) return;
    const container = turnstileRef.current;
    if (!container) return;
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    const renderWidget = () => {
      if (cancelled || !turnstileRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action: "contact",
        theme: "light",
        size: "flexible",
        appearance: "interaction-only",
        callback: (token) => {
          tokenRef.current = token;
          setTurnstilePassed(true);
        },
        "expired-callback": () => {
          tokenRef.current = "";
          setTurnstilePassed(false);
        },
        "error-callback": () => {
          tokenRef.current = "";
          setTurnstilePassed(false);
        },
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      script = document.getElementById(
        "cf-turnstile-api",
      ) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = "cf-turnstile-api";
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderWidget);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderWidget);
      const id = widgetIdRef.current;
      if (id && window.turnstile) window.turnstile.remove(id);
      widgetIdRef.current = null;
      tokenRef.current = "";
      setTurnstilePassed(false);
    };
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (!TURNSTILE_SITE_KEY) {
      setStatus("error");
      setErrorMsg(
        `La vérification anti-robot n’est pas configurée. Écrivez à ${SITE.email}.`,
      );
      return;
    }
    if (!tokenRef.current) {
      setStatus("error");
      setErrorMsg(
        "La vérification anti-robot n’est pas encore prête. Patientez un instant, puis réessayez.",
      );
      return;
    }

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
          source: sourceRef.current,
          turnstileToken: tokenRef.current,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        resetTurnstile();
        setStatus("error");
        setErrorMsg(
          payload.error ||
            "Une erreur est survenue. Réessayez ou écrivez à contact@jennifervoyages.fr.",
        );
        return;
      }

      setStatus("success");
      form.reset();
      resetTurnstile();
    } catch {
      resetTurnstile();
      setStatus("error");
      setErrorMsg(
        "Impossible d’envoyer le message. Vérifiez votre connexion ou utilisez l’email.",
      );
    }
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="contact-dialog w-[min(calc(100%-1.75rem),36rem)] rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl"
        onClose={() => {
          setPrivacyOpen(false);
          setOpen(false);
          if (!closingRef.current) {
            setMinimized(formHasDraft(formRef.current));
            stripHash();
          }
          closingRef.current = false;
        }}
        onCancel={(e) => {
          e.preventDefault();
          if (confirmDismiss) {
            setConfirmDismiss(false);
            return;
          }
          if (privacyOpenRef.current) {
            setPrivacyOpen(false);
            return;
          }
          minimize();
        }}
        onPointerDown={(e) => {
          backdropPointerDownRef.current = e.target === dialogRef.current;
        }}
        onClick={(e) => {
          // Ne réduire que si clic complet sur le fond (pas un glisser depuis un champ)
          if (
            backdropPointerDownRef.current &&
            e.target === dialogRef.current
          ) {
            // Vue RGPD : le fond ne ferme pas le formulaire (Précédent uniquement)
            if (privacyOpenRef.current) {
              setPrivacyOpen(false);
            } else {
              minimize();
            }
          }
          backdropPointerDownRef.current = false;
        }}
      >
        {/* Réduire / fermer uniquement sur le formulaire — pas sur la vue RGPD (Précédent seul) */}
        {!privacyOpen ? (
          <div className="sticky top-0 z-40 flex shrink-0 items-center justify-end gap-0.5 border-b border-border/70 bg-card px-2 py-1.5">
            <button
              type="button"
              onClick={minimize}
              className="contact-dialog-icon-btn inline-flex h-11 w-11 touch-manipulation items-center justify-center border-0 bg-transparent text-muted shadow-none hover:text-foreground focus:outline-none focus-visible:text-foreground focus-visible:outline-none active:opacity-50"
              aria-label="Réduire le formulaire"
              title="Réduire"
            >
              <Minus className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="contact-dialog-icon-btn inline-flex h-11 w-11 touch-manipulation items-center justify-center border-0 bg-transparent text-muted shadow-none hover:text-foreground focus:outline-none focus-visible:text-foreground focus-visible:outline-none active:opacity-50"
              aria-label="Fermer le formulaire"
              title="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>
          </div>
        ) : null}

        <div className="relative px-4 py-5 sm:flex sm:min-h-0 sm:flex-1 sm:flex-col sm:overflow-y-auto sm:px-8 sm:pb-0 sm:pt-8">
          {confirmDismiss ? (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-card/95 px-5 py-6 backdrop-blur-[1px] sm:px-8"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={confirmTitleId}
            >
              <div className="w-full max-w-sm text-center">
                <h2
                  id={confirmTitleId}
                  className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                >
                  Fermer le formulaire ?
                </h2>
                <p className="mt-2 text-sm text-muted sm:text-base">
                  Votre message n’a pas été envoyé. La saisie sera perdue.
                </p>
                <div className="mt-6 flex flex-col-reverse items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setConfirmDismiss(false)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-pastel-mist/60"
                  >
                    Continuer la saisie
                  </button>
                  <button
                    type="button"
                    onClick={clearAndClose}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Fermer quand même
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* hidden+inert (pas unmount) : garde la saisie + formRef sur iOS/Android */}
          <div
            className={
              privacyOpen
                ? "hidden"
                : "sm:flex sm:min-h-0 sm:flex-1 sm:flex-col"
            }
            inert={privacyOpen || undefined}
          >
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-sky">
                Contact
              </p>
              <h2
                id={titleId}
                className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl"
              >
                Parlons de votre voyage
              </h2>
              <p className="mt-3 text-sm text-muted sm:text-base">
                Décrivez votre envie en quelques lignes : je vous réponds
                rapidement.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <a
                  href={`tel:+${SITE.phoneE164}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-pastel-mist/60"
                  aria-label="Appeler par téléphone"
                >
                  <Phone className="h-4 w-4 text-accent-sky" aria-hidden />
                  Téléphone
                </a>
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-pastel-mist/60"
                >
                  WhatsApp
                </a>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-pastel-mist/60"
                >
                  Instagram
                </a>
              </div>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="relative mx-auto mt-6 max-w-xl sm:flex sm:min-h-0 sm:w-full sm:flex-1 sm:flex-col sm:overflow-hidden"
            >
              <div className="space-y-4 sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:overscroll-contain sm:pb-2">
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
                  placeholder="Dates envisagées, nombre de voyageurs, budget, envies…"
                />
              </div>
              <div className="relative z-10 flex items-start gap-3 pt-2 text-left text-sm leading-relaxed text-foreground">
                <input
                  id="contact-privacy"
                  name="privacy"
                  type="checkbox"
                  required
                  disabled={status === "loading"}
                  className="mt-1 h-6 w-6 shrink-0 touch-manipulation rounded border-border text-brand-primary focus:ring-brand-primary disabled:opacity-60"
                />
                <p className="min-w-0 flex-1 pt-0.5">
                  <label
                    htmlFor="contact-privacy"
                    className="cursor-pointer touch-manipulation"
                  >
                    J&apos;accepte que mes données soient traitées conformément
                    à la{" "}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      blurActiveField();
                      setPrivacyOpen(true);
                    }}
                    className="touch-manipulation font-medium text-brand-primary underline underline-offset-2 hover:opacity-90"
                  >
                    politique de confidentialité
                  </button>
                  .
                </p>
              </div>
              {TURNSTILE_SITE_KEY ? (
                <div
                  hidden={turnstilePassed}
                  className="flex justify-center"
                >
                  <div ref={turnstileRef} className="max-w-full" />
                </div>
              ) : (
                <p className="text-center text-sm text-accent-coral" role="status">
                  La vérification anti-robot n’est pas configurée. Écrivez à{" "}
                  {SITE.email}.
                </p>
              )}
              </div>
              <div className="bg-card pt-4 sm:shrink-0 sm:pb-8 sm:pt-3">
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[16rem] sm:px-10"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    {status === "loading" ? "Envoi…" : "Envoyer le message"}
                  </button>
                </div>
              {status === "success" ? (
                <p className="text-center text-sm text-accent-mint" role="status">
                  Merci ! Votre message a bien été envoyé. Je vous réponds dès
                  que possible.
                </p>
              ) : null}
              {status === "error" ? (
                <p className="text-center text-sm text-accent-coral" role="alert">
                  {errorMsg}
                </p>
              ) : null}
              </div>
            </form>
          </div>

          {privacyOpen ? (
            <div
              className="mx-auto max-w-xl"
              role="region"
              aria-labelledby={privacyTitleId}
            >
              <button
                id="contact-privacy-back"
                type="button"
                onClick={() => setPrivacyOpen(false)}
                className={`${backLinkClass} touch-manipulation`}
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Précédent
              </button>
              <h2
                id={privacyTitleId}
                className="mt-5 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                Politique de confidentialité (RGPD)
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-foreground sm:text-[15px]">
                <p>
                  <strong className="font-medium">
                    Collecte des données :
                  </strong>{" "}
                  Les informations recueillies via le formulaire de contact
                  (nom, email, destination souhaitée, message) sont nécessaires
                  pour l&apos;établissement de vos devis et itinéraires.
                </p>
                <p>
                  <strong className="font-medium">Conservation :</strong> Vos
                  données sont conservées pendant une durée de 3 ans après le
                  dernier contact.
                </p>
                <p>
                  <strong className="font-medium">Vos droits :</strong>{" "}
                  Conformément au RGPD, vous disposez d&apos;un droit
                  d&apos;accès, de rectification et de suppression de vos
                  données en écrivant à{" "}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="break-all font-medium text-brand-primary underline underline-offset-2 hover:opacity-90"
                  >
                    {SITE.email}
                  </a>
                  .
                </p>
                <p>
                  <strong className="font-medium">Sous-traitants :</strong> les
                  messages du formulaire (nom, email, destination, message) sont
                  transmis à Resend, Inc. (États-Unis) pour l&apos;envoi de
                  l&apos;email. À l&apos;envoi, Cloudflare Turnstile vérifie
                  qu&apos;il ne s&apos;agit pas d&apos;un robot : l&apos;adresse
                  IP et des signaux techniques du navigateur peuvent être
                  traités. Un compteur temporaire (empreinte de l&apos;adresse
                  IP et de l&apos;email, sans le message) est enregistré chez
                  Upstash pour limiter les envois répétés. Le site est hébergé
                  par Vercel Inc. (États-Unis). Les articles du blog sont
                  stockés chez Notion Labs, Inc. (États-Unis) ; cette base ne
                  contient pas les messages du formulaire. Les boutons WhatsApp
                  et Instagram ouvrent les pages correspondantes chez Meta :
                  aucune donnée du formulaire n&apos;y est envoyée.
                </p>
                <p>
                  <strong className="font-medium">Cookies :</strong> ce site ne
                  dépose pas de cookie publicitaire ni de mesure
                  d&apos;audience. La vérification anti-robot peut déposer un
                  cookie technique.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </dialog>

      {minimized && !open ? (
        <button
          type="button"
          onClick={expand}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[60] inline-flex h-14 items-center gap-2 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white shadow-lg ring-1 ring-black/10 transition-transform hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0"
          aria-label="Rouvrir le formulaire de contact"
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
          <span className="pr-1">Message</span>
        </button>
      ) : null}
    </>
  );
}
