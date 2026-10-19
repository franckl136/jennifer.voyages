import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ContactLink } from "@/components/contact-dialog";
import {
  FooterEmailLink,
  FooterInstagramLink,
  FooterMessageLink,
  FooterPhoneLink,
  FooterShareButton,
} from "@/components/footer-share-button";

const footerNavClass =
  "inline-flex rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-primary/10 bg-brand-cream pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 text-center md:grid-cols-3 md:gap-0">
          <Link
            href="/"
            className="inline-block justify-self-center rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            <BrandLogo
              variant="footer"
              heightClass="h-24 min-h-24 sm:h-28 sm:min-h-28"
            />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Navigation
            </p>
            <ul className="mt-3 flex flex-col items-center gap-0.5 text-sm">
              <li>
                <Link href="/#a-propos" className={footerNavClass}>
                  Qui suis-je ?
                </Link>
              </li>
              <li>
                <Link href="/#services" className={footerNavClass}>
                  Mes services
                </Link>
              </li>
              <li>
                <Link href="/#blog" className={footerNavClass}>
                  Carnets
                </Link>
              </li>
              <li>
                <Link href="/#parcours" className={footerNavClass}>
                  Le parcours
                </Link>
              </li>
              <li>
                <Link href="/#faq" className={footerNavClass}>
                  FAQ
                </Link>
              </li>
              <li>
                <ContactLink source="footer" className={footerNavClass}>
                  Me contacter
                </ContactLink>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Restez en lien
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

        <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-border/80 pt-5 text-center text-xs text-muted sm:flex-row sm:gap-3">
          <span>© {new Date().getFullYear()} Jennifer & Voyages</span>
          <span className="hidden sm:inline" aria-hidden>
            |
          </span>
          <Link
            href="/mentions-legales"
            className="rounded-md px-2 py-1 font-medium text-muted transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
