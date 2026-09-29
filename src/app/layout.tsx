import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
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
    "Explore quinceañera photography and film across Dallas–Fort Worth. View the portfolio and request your date. Collections from $2,500.",
  applicationName: site.brand,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.brand,
    locale: "en_US",
    url: site.url,
    title: `${site.brand} — Quinceañera Photography & Film`,
    description:
      "Explore quinceañera photography and film across Dallas–Fort Worth. View the portfolio and request your date. Collections from $2,500.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.brand} — Quinceañera Photography & Film`,
    description:
      "Explore quinceañera photography and film across Dallas–Fort Worth. View the portfolio and request your date. Collections from $2,500.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
      <body className="flex min-h-screen flex-col bg-cream">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
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
