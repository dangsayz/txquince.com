import type { Metadata } from "next";
import { PhotoDumpPage } from "@/components/txq/PhotoDumpPage";
import { site } from "@/content/site";
import { languageAlternates } from "@/lib/hreflang";

// Reads the R2 photo manifest on each request (admin uploads show at once).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Quinceañera Photos in Dallas–Fort Worth",
  description:
    "The newest quinceañera photos from TX Quince: portraits, church, the party, family and details from recent celebrations across Dallas–Fort Worth.",
  alternates: { canonical: "/photos/latest", languages: languageAlternates("/photos/latest", "/es/fotos-recientes") },
  openGraph: {
    title: "Latest Quinceañera Photos · TX Quince",
    description: "The newest quinceañera photos from recent celebrations across Dallas–Fort Worth.",
    url: `${site.url}/photos/latest`,
  },
};

export default function LatestPhotosPage() {
  return <PhotoDumpPage lang="en" />;
}
