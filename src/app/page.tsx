import type { Metadata } from "next";
import { TxqSite } from "@/components/txq/TxqSite";
import { latestJournal } from "@/components/txq/journal";
import { getCinemaFilms } from "@/components/txq/films";
import { HomeJsonLd } from "@/components/txq/HomeJsonLd";
import { getFeedPage, getHomeOverrides } from "@/lib/photo-dump";
import { resolveHomeSlots } from "@/lib/image-slot-home";
import { SlotProvider } from "@/components/slots/SlotProvider";
import { PRICE_FLOOR_USD } from "@/lib/commission";
import { site } from "@/content/site";

const from = `$${PRICE_FLOOR_USD.toLocaleString("en-US")}`;

// Films come from the admin video library; admin edits revalidate at once.
export const revalidate = 3600;

export const metadata: Metadata = {
  // Leads with the highest-intent local phrase families type.
  title: { absolute: "Quinceañera Photographer & Videographer in Dallas–Fort Worth | TX Quince" },
  description: `Luxury quinceañera photography and film across Dallas–Fort Worth, from Highland Park to Southlake. Published commissions from ${from}, bilingual from first call to final film. Check your date live.`,
  alternates: { canonical: "/", languages: { "en-US": "/", "es-MX": "/es" } },
  openGraph: {
    title: "TX Quince — Quinceañera Photography & Film, Dallas–Fort Worth",
    description: `Quinceañera photos and videos in Dallas–Fort Worth. Packages from ${from}.`,
    url: site.url,
  },
};

export default async function HomePage() {
  // Latest photos + admin image swaps come from the R2 photo manifest; both
  // are empty (section hidden, original images) when storage is unreachable.
  const [films, photos, overrides] = await Promise.all([getCinemaFilms(), getFeedPage(0), getHomeOverrides()]);
  return (
    <>
      <HomeJsonLd lang="en" />
      <SlotProvider slots={await resolveHomeSlots(overrides)}>
        <TxqSite journal={latestJournal()} films={films} photos={photos} overrides={overrides} />
      </SlotProvider>
    </>
  );
}
