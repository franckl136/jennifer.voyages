export type ScrollLockOptions = {
  /**
   * `fixed` — desktop / pointeur fin (bloque aussi le rubber-band).
   * `overflow` — tactile iOS/Android : pas de position:fixed (évite taps décalés après clavier).
   */
  strategy?: "fixed" | "overflow";
  /** Zones où le touchmove reste autorisé (stratégie overflow). */
  allowSelector?: string;
  /**
   * Position à rétablir. À passer si le document a déjà bougé
   * (showModal, ancre #contact) avant l’appel.
   */
  scrollY?: number;
};

/** Annule `scroll-behavior: smooth` le temps d’un showModal / close / scrollTo. */
export function pinScrollBehavior() {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  return () => {
    html.style.scrollBehavior = previous;
  };
}

/** Restaure le scroll sans animation (le smooth du html envoie sinon en haut ou en bas). */
export function restoreWindowScroll(scrollY: number) {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  html.style.scrollBehavior = previous;
}

/**
 * Verrouille le scroll de la page derrière une modale / un menu.
 */
export function lockBodyScroll(options: ScrollLockOptions = {}) {
  const strategy = options.strategy ?? "fixed";
  const allowSelector =
    options.allowSelector ?? ".contact-dialog, [data-scroll-lock-allow]";

  const { body, documentElement: html } = document;
  const scrollY = options.scrollY ?? window.scrollY;

  if (strategy === "overflow") {
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

  const prev = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
  };

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";

  return () => {
    html.style.overflow = prev.htmlOverflow;
    body.style.overflow = prev.bodyOverflow;
    body.style.position = prev.bodyPosition;
    body.style.top = prev.bodyTop;
    body.style.left = prev.bodyLeft;
    body.style.right = prev.bodyRight;
    body.style.width = prev.bodyWidth;
    restoreWindowScroll(scrollY);
  };
}
