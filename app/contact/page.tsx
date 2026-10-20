"use client";

import { useEffect } from "react";

/** Compat : /contact renvoie vers #contact sans changer de « page » de fond. */
export default function ContactRedirectPage() {
  useEffect(() => {
    window.location.replace("/#contact");
  }, []);

  return (
    <p className="p-8 text-center text-sm text-muted">Ouverture du contact…</p>
  );
}
