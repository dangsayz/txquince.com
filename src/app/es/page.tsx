import type { Metadata } from "next";
import { EditorialHome } from "@/components/editorial/EditorialHome";
import { editorialFonts } from "@/components/editorial/fonts";
import { latestJournal } from "@/components/txq/journal";
import { getCinemaFilms } from "@/components/txq/films";
import { HomeJsonLd } from "@/components/txq/HomeJsonLd";
import { getHomeOverrides } from "@/lib/photo-dump";
import { priceFloor, usd } from "@/lib/commission";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { resolveHomeSlots } from "@/lib/image-slot-home";
import { SlotProvider } from "@/components/slots/SlotProvider";
import { getPortfolioImages } from "@/lib/content-db";
import { galleriesFromImages } from "@/lib/home-galleries";
import { favoritesFromImages } from "@/lib/favorites";
import { FavoritesJsonLd } from "@/components/editorial/FavoritesJsonLd";
import { homeCities } from "@/content/home-places";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

// Films come from the admin video library; admin edits revalidate at once.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const from = usd(priceFloor(await getPriceBook()));
  return {
    title: { absolute: "Fotógrafo y Videógrafo de Quinceañeras en Dallas–Fort Worth | TX Quince" },
    description: `Fotografía y cine de quinceañera de lujo en Dallas–Fort Worth, de Highland Park a Southlake. Encargos publicados desde ${from}, en español de la primera llamada a la película final. Consulta tu fecha en vivo.`,
    alternates: { canonical: "/es", languages: languageAlternates("/", "/es") },
    openGraph: {
      locale: OG_LOCALE.es,
      title: "TX Quince — Fotografía y cine de quinceañera, Dallas–Fort Worth",
      description: `Retratos editoriales y cine para la quinceañera. Encargos desde ${from}.`,
    },
  };
}

export default async function InicioEs() {
  // Latest photos + admin image swaps come from the R2 photo manifest; both
  // are empty (section hidden, original images) when storage is unreachable.
  // The gallery section is the real portfolio, grouped by shoot (empty when
  // the database is unreachable; the section then shows real photos instead).
  const [films, overrides, book, portfolio] = await Promise.all([
    getCinemaFilms(),
    getHomeOverrides(),
    getPriceBook(),
    getPortfolioImages(),
  ]);
  const favorites = favoritesFromImages(portfolio);
  return (
    <>
      <HomeJsonLd lang="es" book={book} />
      <FavoritesJsonLd favorites={favorites} lang="es" />
      <SlotProvider slots={await resolveHomeSlots(overrides)}>
        <div className={editorialFonts}>
          <EditorialHome journal={fillDeep(latestJournal(), book)} films={films} overrides={overrides} galleries={galleriesFromImages(portfolio)} cities={homeCities()} favorites={favorites} />
        </div>
      </SlotProvider>
    </>
  );
}
