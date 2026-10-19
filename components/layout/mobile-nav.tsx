"use client";

import { ContactLink } from "@/components/contact-dialog";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

const nav = [
  { href: "/#services", label: "Mes services" },
  { href: "/#blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]"
            aria-label="Fermer le menu"
            onClick={close}
          />
          <nav
            id={panelId}
            className="absolute inset-x-0 top-full z-50 border-b border-brand-primary/10 bg-brand-cream px-4 py-5 shadow-lg sm:px-6"
            aria-label="Navigation mobile"
          >
            <ul className="flex flex-col items-center gap-1">
              {nav.map((item) => (
                <li key={item.href} className="w-full max-w-xs">
                  {item.href === "/#contact" ? (
                    <ContactLink
                      className="block rounded-xl px-3 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-card"
                      onClick={close}
                    >
                      {item.label}
                    </ContactLink>
                  ) : (
                    <Link
                      href={item.href}
                      className="block rounded-xl px-3 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-card"
                      onClick={close}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-center">
              <ContactLink
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white shadow-sm"
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
