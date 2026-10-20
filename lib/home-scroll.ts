export const HOME_SCROLL_KEY = "jv-scroll-section";

export function requestHomeScroll(sectionId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HOME_SCROLL_KEY, sectionId);
}

/** Hauteur réelle du header sticky (évite le décalage Carnets). */
function stickyHeaderHeight() {
  const header = document.querySelector("header.sticky");
  if (header instanceof HTMLElement) {
    return header.getBoundingClientRect().height;
  }
  return 0;
}

/**
 * Scroll pour placer le haut de la section juste sous le header sticky.
 */
export function scrollToHomeSection(
  sectionId: string,
  behavior: ScrollBehavior = "instant",
) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  const top =
    el.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight();
  window.scrollTo({ top: Math.max(0, top), behavior });
}
