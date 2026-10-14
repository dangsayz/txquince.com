import type { Metadata } from "next";
import { TxqSite } from "@/components/txq/TxqSite";
import { latestJournal } from "@/components/txq/journal";
import { getCinemaFilms } from "@/components/txq/films";
import { HomeJsonLd } from "@/components/txq/HomeJsonLd";
import { getFeedPage, getHomeOverrides } from "@/lib/photo-dump";
import { PRICE_FLOOR_USD, usd } from "@/lib/commission";

// Films come from the admin video library; admin edits revalidate at once.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Fotógrafo y Videógrafo de Quinceañeras en Dallas–Fort Worth | TX Quince" },
  description: `Fotografía y cine de quinceañera de lujo en Dallas–Fort Worth, de Highland Park a Southlake. Encargos publicados desde ${usd(PRICE_FLOOR_USD)}, en español de la primera llamada a la película final. Consulta tu fecha en vivo.`,
  alternates: { canonical: "/es", languages: { "en-US": "/", "es-MX": "/es" } },
  openGraph: {
    locale: "es_MX",
    title: "TX Quince — Fotografía y cine de quinceañera, Dallas–Fort Worth",
    description: `Retratos editoriales y cine para la quinceañera. Encargos desde ${usd(PRICE_FLOOR_USD)}.`,
  },
};

export default async function InicioEs() {
  // Latest photos + admin image swaps come from the R2 photo manifest; both
  // are empty (section hidden, original images) when storage is unreachable.
  const [films, photos, overrides] = await Promise.all([getCinemaFilms(), getFeedPage(0), getHomeOverrides()]);
  return (
    <>
      <HomeJsonLd lang="es" />
      <TxqSite journal={latestJournal()} films={films} photos={photos} overrides={overrides} />
    </>
  );
}
