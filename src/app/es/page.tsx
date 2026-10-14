import type { Metadata } from "next";
import { TxqSite } from "@/components/txq/TxqSite";
import { latestJournal } from "@/components/txq/journal";
import { getCinemaFilms } from "@/components/txq/films";
import { HomeJsonLd } from "@/components/txq/HomeJsonLd";
import { getFeedPage, getHomeOverrides } from "@/lib/photo-dump";
import { priceFloor, usd } from "@/lib/commission";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";

// Films come from the admin video library; admin edits revalidate at once.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const from = usd(priceFloor(await getPriceBook()));
  return {
    title: { absolute: "Fotógrafo y Videógrafo de Quinceañeras en Dallas–Fort Worth | TX Quince" },
    description: `Fotografía y cine de quinceañera de lujo en Dallas–Fort Worth, de Highland Park a Southlake. Encargos publicados desde ${from}, en español de la primera llamada a la película final. Consulta tu fecha en vivo.`,
    alternates: { canonical: "/es", languages: { "en-US": "/", "es-MX": "/es" } },
    openGraph: {
      locale: "es_MX",
      title: "TX Quince — Fotografía y cine de quinceañera, Dallas–Fort Worth",
      description: `Retratos editoriales y cine para la quinceañera. Encargos desde ${from}.`,
    },
  };
}

export default async function InicioEs() {
  // Latest photos + admin image swaps come from the R2 photo manifest; both
  // are empty (section hidden, original images) when storage is unreachable.
  const [films, photos, overrides, book] = await Promise.all([
    getCinemaFilms(),
    getFeedPage(0),
    getHomeOverrides(),
    getPriceBook(),
  ]);
  return (
    <>
      <HomeJsonLd lang="es" book={book} />
      <TxqSite journal={fillDeep(latestJournal(), book)} films={films} photos={photos} overrides={overrides} />
    </>
  );
}
