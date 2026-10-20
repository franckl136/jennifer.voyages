"use client";

import {
  HOME_SCROLL_KEY,
  scrollToHomeSection,
} from "@/lib/home-scroll";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Au retour sur l’accueil : place la section demandée juste sous le header
 * (rejoue à chaque visite de `/`, pas seulement au premier mount).
 */
export function HomeScroll() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== "/") return;

    const id = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (!id) return;
    sessionStorage.removeItem(HOME_SCROLL_KEY);

    // Double rAF : layout / images de section stabilisés après soft-nav
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        scrollToHomeSection(id, "instant");
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
