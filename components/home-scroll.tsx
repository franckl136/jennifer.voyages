"use client";

import {
  clearHomeScroll,
  peekHomeScroll,
  scrollToHomeSection,
} from "@/lib/home-scroll";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Au retour sur l’accueil : place la section demandée juste sous le header.
 * Relance tant que la cible n’est pas prête (Suspense blog) et après stabilisation layout.
 */
export function HomeScroll() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== "/") return;

    const id = peekHomeScroll();
    if (!id) return;

    let cancelled = false;
    let raf = 0;
    let tries = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const apply = () => {
      if (cancelled) return false;
      return scrollToHomeSection(id, "instant");
    };

    const settle = () => {
      // Recalcule après swap Suspense / images (évite flash puis dérive)
      for (const ms of [50, 150, 350]) {
        timers.push(
          setTimeout(() => {
            if (!cancelled) apply();
          }, ms),
        );
      }
      timers.push(
        setTimeout(() => {
          if (!cancelled) clearHomeScroll();
        }, 400),
      );
    };

    const tick = () => {
      if (cancelled) return;
      if (apply()) {
        settle();
        return;
      }
      tries += 1;
      if (tries < 90) {
        raf = requestAnimationFrame(tick);
      } else {
        clearHomeScroll();
      }
    };

    tick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      for (const t of timers) clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
