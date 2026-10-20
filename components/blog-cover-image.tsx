"use client";

import { useLayoutEffect, useRef, useState } from "react";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Hero / LCP : pas de fondu, affichage dès que les octets arrivent. */
  priority?: boolean;
};

/**
 * Couvertures blog. `priority` = article / premières cartes (pas de flash opacity).
 * Grille : léger fondu uniquement si l’image n’est pas déjà en cache.
 */
export function BlogCoverImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  priority = false,
}: BlogCoverImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(priority);

  useLayoutEffect(() => {
    setFailed(false);
    if (priority) {
      setLoaded(true);
      return;
    }
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src, priority]);

  if (failed) {
    return (
      <div className="absolute inset-0 bg-pastel-mist" aria-hidden />
    );
  }

  return (
    <>
      {!priority && !loaded ? (
        <div
          className="absolute inset-0 animate-pulse bg-pastel-mist motion-reduce:animate-none"
          aria-hidden
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        key={src}
        src={src}
        alt={alt}
        className={
          priority
            ? className
            : `${className} duration-300 ease-out motion-reduce:transition-none ${
                loaded ? "opacity-100" : "opacity-0"
              }`
        }
        style={
          priority
            ? undefined
            : { transitionProperty: "opacity, transform" }
        }
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}
