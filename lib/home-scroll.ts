export const HOME_SCROLL_KEY = "jv-scroll-section";

export function requestHomeScroll(sectionId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HOME_SCROLL_KEY, sectionId);
}
