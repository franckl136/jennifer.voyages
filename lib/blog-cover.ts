import { getImageProps } from "next/image";

/** Dimensions / qualité partagées grille ↔ article → même entrée cache `/_next/image`. */
export const BLOG_COVER_WIDTH = 1200;
export const BLOG_COVER_HEIGHT = 750;
export const BLOG_COVER_QUALITY = 75;
export const BLOG_COVER_SIZES = "(max-width: 768px) 100vw, 768px";

/** URL optimisée Next (pour prefetch au survol). */
export function getBlogCoverOptimizedSrc(coverUrl: string) {
  const { props } = getImageProps({
    src: coverUrl,
    width: BLOG_COVER_WIDTH,
    height: BLOG_COVER_HEIGHT,
    quality: BLOG_COVER_QUALITY,
    alt: "",
  });
  return props.src;
}
