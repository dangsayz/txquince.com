import type { Metadata } from "next";
import { HomeSite } from "@/components/home/HomeSite";
import { latestJournal } from "@/components/txq/journal";
import { getCinemaFilms } from "@/components/txq/films";
import { HomeJsonLd } from "@/components/txq/HomeJsonLd";
import { getFeedPage, getHomeOverrides } from "@/lib/photo-dump";
import { priceFloor, usd } from "@/lib/commission";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { resolveHomeSlots } from "@/lib/image-slot-home";
import { SlotProvider } from "@/components/slots/SlotProvider";
import { getPortfolioImages } from "@/lib/content-db";
import { galleriesFromImages } from "@/lib/home-galleries";
import { homeCities } from "@/content/home-places";
import { site } from "@/content/site";
import { languageAlternates } from "@/lib/hreflang";

// Films come from the admin video library; admin edits revalidate at once.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const from = usd(priceFloor(await getPriceBook()));
  return {
    // Leads with the highest-intent local phrase families type.
    title: { absolute: "Quinceañera Photographer & Videographer in Dallas–Fort Worth | TX Quince" },
    description: `Luxury quinceañera photography and film across Dallas–Fort Worth, from Highland Park to Southlake. Published commissions from ${from}, bilingual from first call to final film. Check your date live.`,
    alternates: { canonical: "/", languages: languageAlternates("/", "/es") },
    openGraph: {
      title: "TX Quince — Quinceañera Photography & Film, Dallas–Fort Worth",
      description: `Quinceañera photos and videos in Dallas–Fort Worth. Packages from ${from}.`,
      url: site.url,
    },
  };
}

export default async function HomePage() {
  // Latest photos + admin image swaps come from the R2 photo manifest; both
  // are empty (section hidden, original images) when storage is unreachable.
  // The gallery section is the real portfolio, grouped by shoot (empty when
  // the database is unreachable; the section then shows real photos instead).
  const [films, photos, overrides, book, portfolio] = await Promise.all([
    getCinemaFilms(),
    getFeedPage(0),
    getHomeOverrides(),
    getPriceBook(),
    getPortfolioImages(),
  ]);
  return (
    <>
      <HomeJsonLd lang="en" book={book} />
      <SlotProvider slots={await resolveHomeSlots(overrides)}>
        <HomeSite journal={fillDeep(latestJournal(), book)} films={films} photos={photos} overrides={overrides} galleries={galleriesFromImages(portfolio)} cities={homeCities()} />
      </SlotProvider>
    </>
  );
}
