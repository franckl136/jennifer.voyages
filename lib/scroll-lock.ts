/**
 * Verrouille le scroll de la page derrière une modale.
 * Évite `position: fixed` sur le body (saccades clavier iOS au changement de champ).
 * Sur tactile : bloque les touchmove hors zone autorisée.
 */
export function lockBodyScroll(allowSelector = ".contact-dialog, [data-scroll-lock-allow]") {
  const { body, documentElement: html } = document;

  const prev = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyOverscroll: body.style.overscrollBehavior,
  };

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";

  const onTouchMove = (e: TouchEvent) => {
    const target = e.target;
    if (!(target instanceof Element)) {
      e.preventDefault();
      return;
    }
    if (target.closest(allowSelector)) return;
    e.preventDefault();
  };

  document.addEventListener("touchmove", onTouchMove, { passive: false });

  return () => {
    document.removeEventListener("touchmove", onTouchMove);
    html.style.overflow = prev.htmlOverflow;
    body.style.overflow = prev.bodyOverflow;
    body.style.overscrollBehavior = prev.bodyOverscroll;
  };
}
