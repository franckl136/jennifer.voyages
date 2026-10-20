"use client";

import { useState } from "react";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Priorité visuelle (premières cartes). */
  priority?: boolean;
};

/**
 * Couvertures blog. Les URLs Notion sont passées par `/api/notion-cover`
 * (stables) ; repli pastel si le chargement échoue.
 */
export function BlogCoverImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  priority = false,
}: BlogCoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 bg-pastel-mist" aria-hidden />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  );
}
