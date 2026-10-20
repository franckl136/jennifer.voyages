"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const TITLE = "Jennifer & Voyages";

/**
 * Verrouille le titre d’onglet : Next peut le remplacer brièvement
 * pendant la navigation / le streaming des métadonnées article.
 */
export function DocumentTitle() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = TITLE;
  }, [pathname]);

  useEffect(() => {
    const el = document.querySelector("title");
    if (!el) return;
    const lock = () => {
      if (document.title !== TITLE) document.title = TITLE;
    };
    const obs = new MutationObserver(lock);
    obs.observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    lock();
    return () => obs.disconnect();
  }, []);

  return null;
}
