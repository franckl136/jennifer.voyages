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
import { SectionLink } from "@/components/section-link";

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
            <div className="relative mt-3">
              <div
                className="pointer-events-none absolute inset-y-1 left-1/2 w-px -translate-x-1/2 bg-border"
                aria-hidden
              />
              <ul className="mx-auto grid w-fit grid-cols-2 gap-x-3 gap-y-0.5 justify-items-center text-sm sm:gap-x-4 md:gap-x-5">
                <li>
                  <SectionLink sectionId="a-propos" className={footerNavClass}>
                    Qui suis-je ?
                  </SectionLink>
                </li>
                <li>
                  <SectionLink sectionId="parcours" className={footerNavClass}>
                    Le parcours
                  </SectionLink>
                </li>
                <li>
                  <SectionLink sectionId="services" className={footerNavClass}>
                    Mes services
                  </SectionLink>
                </li>
                <li>
                  <SectionLink sectionId="faq" className={footerNavClass}>
                    FAQ
                  </SectionLink>
                </li>
                <li>
                  <SectionLink sectionId="blog" className={footerNavClass}>
                    Carnets
                  </SectionLink>
                </li>
                <li>
                  <ContactLink source="footer" className={footerNavClass}>
                    Me contacter
                  </ContactLink>
                </li>
              </ul>
            </div>
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
