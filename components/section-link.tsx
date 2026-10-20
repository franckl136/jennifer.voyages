"use client";

import {
  requestHomeScroll,
  scrollToHomeSection,
} from "@/lib/home-scroll";
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
 * scroll sous le header sticky, sans remonter en haut de page.
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
      scrollToHomeSection(sectionId, "smooth");
      return;
    }
    e.preventDefault();
    requestHomeScroll(sectionId);
    router.push("/", { scroll: false });
  }

  return (
    <Link href="/" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
