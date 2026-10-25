"use client";

import { SectionLink } from "@/components/section-link";
import { backLinkClass } from "@/lib/back-link";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const backClass = `mb-8 ${backLinkClass}`;

/** Lit `from` côté client pour que la page article reste statique. */
export function ArticleBackLink() {
  const from = useSearchParams().get("from");

  if (from === "a-propos") {
    return (
      <SectionLink sectionId="a-propos" className={backClass}>
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Accueil
      </SectionLink>
    );
  }

  if (from === "accueil") {
    return (
      <SectionLink sectionId="blog" className={backClass}>
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Accueil
      </SectionLink>
    );
  }

  return (
    <Link href="/blog" className={backClass}>
      <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Articles
    </Link>
  );
}
