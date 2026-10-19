import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ContactLink } from "@/components/contact-dialog";
import { MobileNav } from "@/components/layout/mobile-nav";

const nav = [
  { href: "/#a-propos", label: "Qui je suis" },
  { href: "/#services", label: "Mes services" },
  { href: "/#blog", label: "Carnets" },
];

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-primary/10 bg-brand-cream/95 backdrop-blur-md supports-[backdrop-filter]:bg-brand-cream/80">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center rounded-lg py-0.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <BrandLogo
            priority
            heightClass="h-16 max-h-16 sm:h-[4.5rem] sm:max-h-[4.5rem] lg:h-20 lg:max-h-20"
          />
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navigation principale"
        >
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ContactLink
            source="header"
            className="hidden min-h-10 items-center rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-[background-color,box-shadow] hover:bg-[#2436a0] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream md:inline-flex"
          >
            Me contacter
          </ContactLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
