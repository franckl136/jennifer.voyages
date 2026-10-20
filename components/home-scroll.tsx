"use client";

import { HOME_SCROLL_KEY } from "@/lib/home-scroll";
import { useEffect } from "react";

/** Au montage de l’accueil : scroll vers la section demandée (sans #). */
export function HomeScroll() {
  useEffect(() => {
    const id = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (!id) return;
    sessionStorage.removeItem(HOME_SCROLL_KEY);
    const run = () => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    requestAnimationFrame(() => {
      window.setTimeout(run, 50);
    });
  }, []);

  return null;
}
