import type { Metadata } from "next";
import { commissionsFromLabel as FROM_TOKEN } from "@/content/commissions";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { VideographerPage } from "@/components/VideographerPage";
import { site } from "@/content/site";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

export const revalidate = 3600;
// Carries a price token (FROM_TOKEN); filled from the live book below.
const META: Metadata = {
  title: "Videógrafo de Quinceañeras en Dallas–Fort Worth",
  description: `Videos de quinceañeras en Dallas–Fort Worth: videos completos en 4K, tráileres cortos y videos verticales cortos para redes sociales. Mira celebraciones reales; paquetes publicados desde ${FROM_TOKEN}.`,
  alternates: { canonical: "/es/videografo-de-quinceaneras", languages: languageAlternates("/quinceanera-videographer", "/es/videografo-de-quinceaneras") },
  openGraph: {
    title: `Video de Quinceañeras en Dallas–Fort Worth · ${site.brand}`,
    description: "Celebraciones reales en video y paquetes de foto y video para quinceañeras en Dallas–Fort Worth.",
    url: `${site.url}/es/videografo-de-quinceaneras`,
    locale: OG_LOCALE.es,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return fillDeep(META, await getPriceBook());
}
export default function Page() { return <VideographerPage locale="es" />; }
