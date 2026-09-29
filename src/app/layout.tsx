import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { PublicSiteFrame } from "@/components/PublicSiteFrame";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { JsonLd } from "@/components/JsonLd";
import { WebAnalytics } from "@/components/WebAnalytics";
import { Tracker } from "@/components/Tracker";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.brand} — Quinceañera Photography & Film | Dallas–Fort Worth`,
    template: `%s · ${site.brand}`,
  },
  description:
    "Quinceañera photography and film across Dallas–Fort Worth. Four clear collections from $1,800, with coverage for portraits, traditions, and the celebration.",
  applicationName: site.brand,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.brand,
    locale: "en_US",
    url: site.url,
    title: `${site.brand} — Quinceañera Photography & Film`,
    description:
      "Cinematic quinceañera photography and film across Dallas–Fort Worth. Collections from $1,800.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.brand} — Quinceañera Photography & Film`,
    description:
      "Cinematic quinceañera photography and film across Dallas–Fort Worth. Collections from $1,800.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
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
      className={`${inter.variable} h-full`}
    >
      <body className="flex min-h-dvh flex-col bg-cream">
        <PublicSiteFrame>{children}</PublicSiteFrame>
        <StickyMobileCTA />
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <WebAnalytics />
        <JsonLd />
      </body>
    </html>
  );
}
