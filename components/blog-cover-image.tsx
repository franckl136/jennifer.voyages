"use client";

import { useEffect, useRef, useState } from "react";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Priorité visuelle (premières cartes). */
  priority?: boolean;
};

/**
 * Couvertures blog : fondu à l’apparition, placeholder le temps du chargement.
 * Les URLs Notion passent par `/api/notion-cover` (stables).
 */
export function BlogCoverImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  priority = false,
}: BlogCoverImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduceMotion(reduce);

    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  if (failed) {
    return (
      <div className="absolute inset-0 bg-pastel-mist" aria-hidden />
    );
  }

  return (
    <>
      {!loaded ? (
        <div
          className={`absolute inset-0 bg-pastel-mist${reduceMotion ? "" : " animate-pulse"}`}
          aria-hidden
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        key={src}
        src={src}
        alt={alt}
        className={`${className} ${
          reduceMotion
            ? loaded
              ? "opacity-100"
              : "opacity-0"
            : `duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"}`
        }`}
        style={
          reduceMotion
            ? undefined
            : { transitionProperty: "opacity, transform" }
        }
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}
