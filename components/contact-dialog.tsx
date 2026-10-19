"use client";

import { SITE, whatsappHref } from "@/lib/site";
import { ArrowLeft, MessageCircle, Minus, Phone, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const fieldClass =
  "w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none ring-foreground/10 placeholder:text-muted focus:ring-2 disabled:opacity-60";

const CONTACT_EVENT = "jv-open-contact";

type Status = "idle" | "loading" | "success" | "error";

type ContactLinkProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

/** Ouvre la fenêtre de contact sans quitter la page. */
export function ContactLink({ className, children, onClick }: ContactLinkProps) {
  return (
    <a
      href="/#contact"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        window.dispatchEvent(new Event(CONTACT_EVENT));
      }}
    >
      {children}
    </a>
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
  const titleId = useId();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const privacyTitleId = useId();
  const confirmTitleId = useId();

  useEffect(() => {
    privacyOpenRef.current = privacyOpen;
  }, [privacyOpen]);

  const stripHash = useCallback(() => {
    if (window.location.hash !== "#contact") return;
    const base = window.location.pathname + window.location.search;
    if (pushedRef.current) {
      pushedRef.current = false;
      history.back();
      return;
    }
    history.replaceState(null, "", base);
  }, []);

  const ensureHash = useCallback(() => {
    if (window.location.hash === "#contact") return;
    const next = `${window.location.pathname}${window.location.search}#contact`;
    history.pushState(null, "", next);
    pushedRef.current = true;
  }, []);

  const expand = useCallback(() => {
    setMinimized(false);
    setPrivacyOpen(false);
    setConfirmDismiss(false);
    ensureHash();
    setOpen(true);
  }, [ensureHash]);

  /** Réduit le formulaire : l’icône Message n’apparaît que s’il y a une saisie. */
  const minimize = useCallback(() => {
    setPrivacyOpen(false);
    setConfirmDismiss(false);
    setMinimized(formHasDraft(formRef.current));
    stripHash();
    setOpen(false);
  }, [stripHash]);

  const clearAndClose = useCallback(() => {
    setPrivacyOpen(false);
    setConfirmDismiss(false);
    setMinimized(false);
    setStatus("idle");
    setErrorMsg("");
    formRef.current?.reset();
    stripHash();
    setOpen(false);
  }, [stripHash]);

  /** Ferme tout et vide le formulaire (demande confirmation s’il y a une saisie). */
  const dismiss = useCallback(() => {
    if (formHasDraft(formRef.current)) {
      setConfirmDismiss(true);
      return;
    }
    clearAndClose();
  }, [clearAndClose]);

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#contact") {
        setMinimized(false);
        setOpen(true);
        return;
      }
      setOpen(false);
    };
    const onRequest = () => {
      setMinimized(false);
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
  }, [ensureHash]);

  useEffect(() => {
    if (window.location.hash === "#contact") return;
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      closingRef.current = false;
      if (!el.open) el.showModal();
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    setPrivacyOpen(false);
    setConfirmDismiss(false);
    if (el.open) {
      closingRef.current = true;
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el?.open) return;
    el.scrollTop = 0;
    if (privacyOpen) {
      el.querySelector<HTMLButtonElement>("#contact-privacy-back")?.focus();
      return;
    }
    el.querySelector<HTMLInputElement>("#contact-name")?.focus();
  }, [open, privacyOpen]);

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
    <>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="contact-dialog w-[min(calc(100%-1.75rem),36rem)] max-h-[min(calc(100dvh-2.5rem),100%)] overflow-y-auto rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl"
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
        onClick={(e) => {
          if (e.target === dialogRef.current) minimize();
        }}
      >
        <div className="relative px-4 py-5 sm:px-8 sm:py-8">
          <div className="absolute right-2 top-2 z-30 flex items-center gap-0.5 sm:right-3 sm:top-3">
            <button
              type="button"
              onClick={minimize}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-pastel-mist hover:text-foreground sm:h-10 sm:w-10"
              aria-label="Réduire le formulaire"
              title="Réduire"
            >
              <Minus className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-pastel-mist hover:text-foreground sm:h-10 sm:w-10"
              aria-label="Fermer le formulaire"
              title="Fermer"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

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

          <div className={privacyOpen ? "invisible h-0 overflow-hidden" : ""}>
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-sky">
                Contact
              </p>
              <h2
                id={titleId}
                className="mt-2 text-balance pr-20 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                Parlons de votre prochain voyage
              </h2>
              <p className="mt-3 text-sm text-muted sm:text-base">
                Décrivez votre envie en quelques lignes : je vous réponds pour
                échanger sur la faisabilité et la suite ensemble.
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
              className="relative mx-auto mt-6 max-w-xl space-y-4"
              inert={privacyOpen || undefined}
            >
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
              <div className="flex gap-3 pt-1">
                <input
                  id="contact-privacy"
                  name="privacy"
                  type="checkbox"
                  required
                  disabled={status === "loading"}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-brand-primary focus:ring-brand-primary disabled:opacity-60"
                />
                <div className="text-left text-sm leading-relaxed text-foreground">
                  <label htmlFor="contact-privacy" className="cursor-pointer">
                    J&apos;accepte que mes données soient traitées conformément
                    à la{" "}
                  </label>
                  <button
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    className="font-medium text-brand-primary underline underline-offset-2 hover:opacity-90"
                  >
                    politique de confidentialité
                  </button>
                  .
                </div>
              </div>
              <div className="flex justify-center pt-1">
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
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-pastel-mist/60"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Retour au formulaire
              </button>
              <h2
                id={privacyTitleId}
                className="mt-5 text-balance pr-20 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
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
                  l&apos;email. Le site est hébergé par Vercel Inc.
                  (États-Unis). Les articles du blog sont stockés chez Notion
                  Labs, Inc. (États-Unis) ; cette base ne contient pas les
                  messages du formulaire. Les boutons WhatsApp et Instagram
                  ouvrent les pages correspondantes chez Meta : aucune donnée du
                  formulaire n&apos;y est envoyée.
                </p>
                <p>
                  <strong className="font-medium">Cookies :</strong> ce site ne
                  dépose pas de cookie publicitaire ni de mesure
                  d&apos;audience.
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
