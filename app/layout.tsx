import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: true,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a2b88",
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://jennifervoyages.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jennifer & Voyages — Itinéraires, réservations & conseils",
    template: "%s | Jennifer & Voyages",
  },
  description:
    "Itinéraires sur mesure, réservations et conseils pour préparer votre voyage. Écrivez à Jennifer & Voyages.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "any" }],
    shortcut: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Jennifer & Voyages",
    title: "Jennifer & Voyages",
    description:
      "Conception d’itinéraires, réservation et conseils — contactez-moi pour votre prochain voyage.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jennifer & Voyages",
    description:
      "Conception d’itinéraires, réservation et conseils — contactez-moi pour votre prochain voyage.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
