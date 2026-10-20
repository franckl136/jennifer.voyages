"use client";

import Link from "next/link";
import type { ReactNode } from "react";

const warmed = new Set<string>();

function warmCover(src: string | null | undefined) {
  if (!src || warmed.has(src)) return;
  warmed.add(src);
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

type BlogCardLinkProps = {
  href: string;
  coverUrl?: string | null;
  className?: string;
  children: ReactNode;
};

/**
 * Lien carte blog : précharge la couverture au survol / focus / touch
 * pour que l’article l’affiche depuis le cache navigateur.
 */
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
