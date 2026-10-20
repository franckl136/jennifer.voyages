"use client";

import { useEffect, useState } from "react";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Priorité visuelle (premières cartes). */
  priority?: boolean;
};

/**
 * Couvertures Notion (URLs externes). next/image + navigation client
 * laisse parfois les images vides jusqu’à un refresh : on monte l’img
 * après hydratation pour forcer un vrai chargement.
 */
export function BlogCoverImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  priority = false,
}: BlogCoverImageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [src]);

  if (!mounted) {
    return (
      <div
        className="absolute inset-0 bg-pastel-mist"
        aria-hidden
      />
    );
  }

  return (
    // URLs Notion / S3 signées : img native plus fiable que next/image ici
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
