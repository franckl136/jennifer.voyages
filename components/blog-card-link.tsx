"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

const warmed = new Set<string>();

function warmCover(src: string | null | undefined) {
  if (!src || warmed.has(src)) return;
  warmed.add(src);
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

/** Démarre le téléchargement d’une couverture déjà connue, sans attendre le clic. */
export function CoverWarmup({ src }: { src: string }) {
  useEffect(() => {
    warmCover(src);
  }, [src]);
  return null;
}

type BlogCardLinkProps = {
  href: string;
  coverUrl?: string | null;
  className?: string;
  children: ReactNode;
};

/** Précharge la couverture (même URL que la grille / l’article). */
export function BlogCardLink({
  href,
  coverUrl,
  className,
  children,
}: BlogCardLinkProps) {
  const warm = () => warmCover(coverUrl);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
    >
      {children}
    </Link>
  );
}
