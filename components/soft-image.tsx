"use client";

import { useLayoutEffect, useRef, useState } from "react";

type SoftImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Masque le texte alt / icône cassée du navigateur tant que l’image
 * n’a pas fini de charger (fond pastel opaque par-dessus).
 */
export function SoftImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  priority = false,
}: SoftImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    setFailed(false);
    setLoaded(false);
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
          className="absolute inset-0 z-[1] bg-pastel-mist"
          aria-hidden
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        key={src}
        src={src}
        alt={loaded ? alt : ""}
        className={`${className} duration-300 ease-out motion-reduce:transition-none ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionProperty: "opacity, transform" }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}
