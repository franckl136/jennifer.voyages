"use client";

import { SoftImage } from "@/components/soft-image";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** Couverture blog — délègue à SoftImage (pas de flash de texte alt). */
export function BlogCoverImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  priority = false,
}: BlogCoverImageProps) {
  return (
    <SoftImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
    />
  );
}
