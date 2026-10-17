import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import {
  FooterEmailLink,
  FooterInstagramLink,
  FooterMessageLink,
  FooterPhoneLink,
  FooterShareButton,
} from "@/components/footer-share-button";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-primary/10 bg-brand-cream pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <Link
            href="/"
            className="inline-block shrink-0 self-center md:self-start"
          >
            <BrandLogo
              variant="footer"
              heightClass="h-24 min-h-24 sm:h-28 sm:min-h-28"
            />
          </Link>

          <div className="grid flex-1 grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Navigation
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link
                  href="/#services"
                  className="inline-flex py-1.5 text-foreground/80 hover:text-foreground"
                >
                  Mes services
                </Link>
              </li>
              <li>
                <Link
                  href="/#blog"
                  className="inline-flex py-1.5 text-foreground/80 hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="inline-flex py-1.5 text-foreground/80 hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Légal
            </p>
            <ul className="mt-3 text-sm">
              <li>
                <Link
                  href="/mentions-legales"
                  className="inline-flex py-1.5 text-foreground/80 transition-colors hover:text-foreground"
                >
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Contact
            </p>
            <div className="mt-3 flex w-fit flex-col items-center gap-2 text-muted">
              <div className="flex gap-2">
                <FooterPhoneLink />
                <FooterEmailLink />
              </div>
              <div className="flex gap-2">
                <FooterInstagramLink />
                <FooterMessageLink />
              </div>
              <FooterShareButton />
            </div>
          </div>
        </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-border/80 pt-5 text-center text-xs text-muted sm:flex-row sm:gap-3">
          <span>© {new Date().getFullYear()} Jennifer & Voyages</span>
          <span className="hidden sm:inline" aria-hidden>
            |
          </span>
          <Link
            href="/mentions-legales"
            className="font-medium text-foreground/80 underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
