"use client";

import { requestHomeScroll } from "@/lib/home-scroll";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode, MouseEvent } from "react";

type SectionLinkProps = {
  /** id DOM de la section sur l’accueil (ex. blog, services). */
  sectionId: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
};

/**
 * Lien vers une section de l’accueil sans # dans l’URL :
 * scroll sur place si déjà à l’accueil, sinon navigation sans remonter en haut.
 */
export function SectionLink({
  sectionId,
  className,
  children,
  onNavigate,
}: SectionLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    if (pathname === "/") {
      e.preventDefault();
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    e.preventDefault();
    requestHomeScroll(sectionId);
    // scroll: false → évite le flash « haut de page puis descente »
    router.push("/", { scroll: false });
  }

  return (
    <Link href="/" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
