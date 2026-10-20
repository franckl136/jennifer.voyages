"use client";

import { HOME_SCROLL_KEY } from "@/lib/home-scroll";
import { useLayoutEffect } from "react";

/**
 * Au montage de l’accueil : place immédiatement sur la section demandée
 * (sans animation — le smooth après navigation provoquait un saccadement).
 */
export function HomeScroll() {
  useLayoutEffect(() => {
    const id = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (!id) return;
    sessionStorage.removeItem(HOME_SCROLL_KEY);

    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "instant", block: "start" });
  }, []);

  return null;
}
