"use client";

import { getBlogCoverOptimizedSrc } from "@/lib/blog-cover";
import Link from "next/link";
import type { ReactNode } from "react";

const warmed = new Set<string>();

function warmCover(src: string | null | undefined) {
  if (!src || warmed.has(src)) return;
  warmed.add(src);
  try {
    const optimized = getBlogCoverOptimizedSrc(src);
    const img = new window.Image();
    img.decoding = "async";
    img.src = optimized;
  } catch {
    const img = new window.Image();
    img.src = src;
  }
}

type BlogCardLinkProps = {
  href: string;
  coverUrl?: string | null;
  className?: string;
  children: ReactNode;
};

/** Précharge la version optimisée Next au survol / touch. */
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
