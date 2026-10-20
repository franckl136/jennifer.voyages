export const HOME_SCROLL_KEY = "jv-scroll-section";

/** Mémoire module : survit au double-mount Strict Mode (dev) où sessionStorage est consommé trop tôt. */
let pendingSectionId: string | null = null;

export function requestHomeScroll(sectionId: string) {
  pendingSectionId = sectionId;
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HOME_SCROLL_KEY, sectionId);
}

export function peekHomeScroll(): string | null {
  if (pendingSectionId) return pendingSectionId;
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(HOME_SCROLL_KEY);
}

export function clearHomeScroll() {
  pendingSectionId = null;
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(HOME_SCROLL_KEY);
}

/** Hauteur réelle du header sticky (évite le décalage Carnets). */
function stickyHeaderHeight() {
  const header = document.querySelector("header.sticky");
  if (header instanceof HTMLElement) {
    return header.getBoundingClientRect().height;
  }
  return 0;
}

function resolveSectionEl(sectionId: string): HTMLElement | null {
  const byId = document.getElementById(sectionId);
  if (byId) return byId;
  // Skeleton Suspense (sans id, pour ne pas « voler » l’ancre de la vraie section)
  return document.querySelector<HTMLElement>(
    `[data-home-scroll="${sectionId}"]`,
  );
}

/**
 * Scroll pour placer le haut de la section juste sous le header sticky.
 * @returns true si l’élément était présent
 */
export function scrollToHomeSection(
  sectionId: string,
  behavior: ScrollBehavior = "instant",
): boolean {
  const el = resolveSectionEl(sectionId);
  if (!el) return false;

  const top =
    el.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight();
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}
