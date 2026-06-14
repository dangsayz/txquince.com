import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { JsonLd } from "@/components/JsonLd";
import { WebAnalytics } from "@/components/WebAnalytics";
import { Tracker } from "@/components/Tracker";
import { Suspense } from "react";

// Display serif (refined, couture) + clean sans body.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
// Delicate copperplate script — used sparingly for couture accents.
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.brand} — Quinceañera Photography & Film | Dallas–Fort Worth`,
    template: `%s · ${site.brand}`,
  },
  description:
    "Cinematic quinceañera photography and film across Dallas–Fort Worth. Two storytellers, one unrepeatable day — collections from $1,800.",
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
  themeColor: "#f4eae0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${pinyon.variable} h-full`}
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
