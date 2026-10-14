import type { Metadata } from "next";
import { commissionsFromLabel } from "@/content/commissions";
import { VideographerPage } from "@/components/VideographerPage";
import { site } from "@/content/site";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Videógrafo de Quinceañeras en Dallas–Fort Worth",
  description: `Videos de quinceañeras en Dallas–Fort Worth: videos completos en 4K, tráileres cortos y videos verticales cortos para redes sociales. Mira celebraciones reales; paquetes publicados desde ${commissionsFromLabel}.`,
  alternates: { canonical: "/es/videografo-de-quinceaneras", languages: { "en-US": "/quinceanera-videographer", "es-MX": "/es/videografo-de-quinceaneras" } },
  openGraph: {
    title: `Video de Quinceañeras en Dallas–Fort Worth · ${site.brand}`,
    description: "Celebraciones reales en video y paquetes de foto y video para quinceañeras en Dallas–Fort Worth.",
    url: `${site.url}/es/videografo-de-quinceaneras`,
    locale: "es_MX",
  },
};
export default function Page() { return <VideographerPage locale="es" />; }
