import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ContactLink } from "@/components/contact-dialog";
import { MobileNav } from "@/components/layout/mobile-nav";

const nav = [
  { href: "/#services", label: "Mes services" },
  { href: "/#blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-primary/10 bg-brand-cream">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center py-0.5">
          <BrandLogo
            priority
            heightClass="h-16 max-h-16 sm:h-[4.5rem] sm:max-h-[4.5rem] lg:h-20 lg:max-h-20"
          />
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm font-medium text-muted md:flex"
          aria-label="Navigation principale"
        >
          {nav.map((item) =>
            item.href === "/#contact" ? (
              <ContactLink
                key={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </ContactLink>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ContactLink className="hidden min-h-10 items-center rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 md:inline-flex">
            Me contacter
          </ContactLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
