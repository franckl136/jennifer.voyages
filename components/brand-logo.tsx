import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
  heightClass?: string;
  /** Logo plus large (ex. pied de page) */
  variant?: "default" | "footer";
};

/**
 * Logo « Jennifer & Voyages » (fichier public/images/logo.png).
 */
export function BrandLogo({
  className = "",
  priority = false,
  heightClass = "h-11 sm:h-12",
  variant = "default",
}: Props) {
  const maxW =
    variant === "footer"
      ? "max-w-[min(100%,min(90vw,28rem))]"
      : "max-w-[min(100%,380px)]";
  const intrinsic =
    variant === "footer" ? { width: 560, height: 145 } : { width: 480, height: 124 };

  return (
    <span className="inline-flex items-center">
      <Image
        src="/images/logo.png"
        alt="Jennifer & Voyages"
        width={intrinsic.width}
        height={intrinsic.height}
        priority={priority}
        unoptimized
        className={`w-auto ${maxW} object-contain object-left drop-shadow-[0_1px_3px_rgba(26,43,136,0.2)] ${heightClass} ${className}`.trim()}
      />
    </span>
  );
}
