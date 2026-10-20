"use client";

import {
  BLOG_COVER_HEIGHT,
  BLOG_COVER_QUALITY,
  BLOG_COVER_SIZES,
  BLOG_COVER_WIDTH,
} from "@/lib/blog-cover";
import Image from "next/image";
import { useState } from "react";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Couverture via next/image (WebP/AVIF compressés par l’optimizer Vercel).
 * Même width/quality que la page article → cache partagé.
 */
export function BlogCoverImage({
  src,
  alt,
  className = "object-cover",
  priority = false,
}: BlogCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(priority);

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
      <Image
        src={src}
        alt={alt}
        width={BLOG_COVER_WIDTH}
        height={BLOG_COVER_HEIGHT}
        quality={BLOG_COVER_QUALITY}
        sizes={BLOG_COVER_SIZES}
        priority={priority}
        className={`absolute inset-0 h-full w-full ${className} ${
          priority
            ? ""
            : `duration-300 ease-out motion-reduce:transition-none ${
                loaded ? "opacity-100" : "opacity-0"
              }`
        }`}
        style={
          priority ? undefined : { transitionProperty: "opacity, transform" }
        }
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}
