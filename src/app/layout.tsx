import type { Metadata, Viewport } from "next";
import { commissionsFromLabel } from "@/content/commissions";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { PublicSiteFrame } from "@/components/PublicSiteFrame";
import { JsonLd } from "@/components/JsonLd";
import { WebAnalytics } from "@/components/WebAnalytics";
import { Tracker } from "@/components/Tracker";
import { Suspense } from "react";

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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.brand} — Quinceañera Photos & Video | Dallas–Fort Worth`,
    template: `%s · ${site.brand}`,
  },
  description:
    `Luxury quinceañera photos and video across Dallas–Fort Worth. Four published packages from ${commissionsFromLabel}, from the portrait session to the last dance.`,
  applicationName: site.brand,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.brand,
    locale: "en_US",
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
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable} h-full`}
    >
      <body className="flex min-h-dvh flex-col bg-cream">
        <PublicSiteFrame>{children}</PublicSiteFrame>
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <WebAnalytics />
        <JsonLd />
      </body>
    </html>
  );
}
