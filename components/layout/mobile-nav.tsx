"use client";

import { ContactLink } from "@/components/contact-dialog";
import { SectionLink } from "@/components/section-link";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

const nav = [
  { sectionId: "a-propos", label: "Qui suis-je ?" },
  { sectionId: "services", label: "Mes services" },
  { sectionId: "blog", label: "Carnets" },
];

type MobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const panelId = useId();
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const [panelTop, setPanelTop] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // overflow (pas fixed) : le header sticky reste visible hors du haut de page
    const unlock = lockBodyScroll({
      strategy: "overflow",
      allowSelector: "header, [data-scroll-lock-allow]",
    });
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const syncTop = () => {
      const header = document.querySelector("header");
      if (header instanceof HTMLElement) {
        setPanelTop(header.getBoundingClientRect().bottom);
      }
    };
    syncTop();
    window.addEventListener("resize", syncTop);
    return () => window.removeEventListener("resize", syncTop);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="relative z-[60] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:border-brand-primary/25 hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/30"
            aria-label="Fermer le menu"
            onClick={close}
          />
          <nav
            id={panelId}
            data-scroll-lock-allow
            style={{ top: panelTop }}
            className="fixed inset-x-0 z-50 border-b border-brand-primary/10 bg-brand-cream px-4 py-5 shadow-lg sm:px-6"
            aria-label="Navigation mobile"
          >
            <ul className="flex flex-col items-center gap-1">
              {nav.map((item) => (
                <li key={item.sectionId} className="w-full max-w-xs">
                  <SectionLink
                    sectionId={item.sectionId}
                    className="block rounded-xl px-3 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
                    onNavigate={close}
                  >
                    {item.label}
                  </SectionLink>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-center">
              <ContactLink
                source="menu-mobile"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition-[background-color,box-shadow] hover:bg-[#2436a0] hover:shadow-md"
                onClick={close}
              >
                Me contacter
              </ContactLink>
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
