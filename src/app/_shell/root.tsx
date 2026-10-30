/**
 * The site's two root layouts share this module: `app/(en)/layout.tsx` (every
 * English route, admin included) and `app/es/layout.tsx` (every Spanish route).
 *
 * There are two root layouts so each language can declare itself on <html>
 * (`lang="en"` / `lang="es"`) in the server HTML. Next allows only one <html>
 * per root layout, and reading the URL in a single root layout would need
 * `headers()`, which would de-opt every static/ISR page to dynamic rendering.
 * Route groups give each subtree its own root layout instead, with no runtime
 * cost. The trade-off Next documents: navigating between the two root layouts
 * (switching language) is a full page load rather than a client transition.
 *
 * `_shell` is a private folder (the underscore keeps it out of routing).
 */
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { commissionsFromLabel } from "@/content/commissions";
import { site } from "@/content/site";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { OG_LOCALE, type SiteLang } from "@/lib/hreflang";
import { PublicSiteFrame } from "@/components/PublicSiteFrame";
import { JsonLd } from "@/components/JsonLd";
import { WebAnalytics } from "@/components/WebAnalytics";
import { Tracker } from "@/components/Tracker";

// One type family site-wide (after linear.app): Inter for display + UI, Geist
// Mono for index labels. The shell and every page read these variables.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-txq-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-txq-mono",
  display: "swap",
});

/**
 * Site-wide metadata defaults. Copy carries price tokens (commissionsFromLabel);
 * filled from the live book.
 *
 * Deliberately NOT set here:
 *   - `alternates.canonical`: a layout canonical is inherited by every page that
 *     forgets its own, so a missing-slug page used to canonicalize to the home
 *     page. Each page declares its own canonical.
 *   - `robots`: indexable is the default with no tag at all. A layout-level
 *     `index, follow` also rendered on not-found pages next to the `noindex`
 *     Next injects there, so one page carried two conflicting robots metas.
 *     Pages that must stay out of the index set `robots` themselves.
 */
const META: Record<SiteLang, Metadata> = {
  en: {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.brand} — Quinceañera Photos & Video | Dallas–Fort Worth`,
      template: `%s · ${site.brand}`,
    },
    description:
      `Luxury quinceañera photos and video across Dallas–Fort Worth. Four published packages from ${commissionsFromLabel}, from the portrait session to the last dance.`,
    applicationName: site.brand,
    openGraph: {
      type: "website",
      siteName: site.brand,
      locale: OG_LOCALE.en,
      url: site.url,
      title: `${site.brand} — Quinceañera Photos & Video`,
      description:
        `Quinceañera photos and video across Dallas–Fort Worth. Packages from ${commissionsFromLabel}.`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.brand} — Quinceañera Photos & Video`,
      description:
        `Quinceañera photos and video across Dallas–Fort Worth. Packages from ${commissionsFromLabel}.`,
    },
  },
  es: {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.brand} — Fotos y video de quinceañera | Dallas–Fort Worth`,
      template: `%s · ${site.brand}`,
    },
    description:
      `Fotografía y video de quinceañera en Dallas–Fort Worth. Cuatro paquetes publicados desde ${commissionsFromLabel}, de la sesión de retratos al último baile.`,
    applicationName: site.brand,
    openGraph: {
      type: "website",
      siteName: site.brand,
      locale: OG_LOCALE.es,
      url: `${site.url}/es`,
      title: `${site.brand} — Fotos y video de quinceañera`,
      description:
        `Fotos y video de quinceañera en Dallas–Fort Worth. Paquetes desde ${commissionsFromLabel}.`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.brand} — Fotos y video de quinceañera`,
      description:
        `Fotos y video de quinceañera en Dallas–Fort Worth. Paquetes desde ${commissionsFromLabel}.`,
    },
  },
};

export async function rootMetadata(lang: SiteLang): Promise<Metadata> {
  return fillDeep(META[lang], await getPriceBook());
}

export const rootViewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
};

export async function RootDocument({
  lang,
  children,
}: Readonly<{ lang: SiteLang; children: React.ReactNode }>) {
  // The live price book (read from R2 per request; launch defaults when unreachable).
  // Handed to every public page's client UI through the site shell.
  const book = await getPriceBook();
  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable} h-full`}
    >
      <body className="flex min-h-dvh flex-col bg-cream">
        <PublicSiteFrame book={book}>{children}</PublicSiteFrame>
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <WebAnalytics />
        <JsonLd book={book} />
      </body>
    </html>
  );
}
