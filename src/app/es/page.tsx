import type { Metadata } from "next";
import { TxqSite } from "@/components/txq/TxqSite";
import { latestJournal } from "@/components/txq/journal";
import { HomeJsonLd } from "@/components/txq/HomeJsonLd";
import { PRICE_FLOOR_USD, usd } from "@/lib/commission";

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

export default function InicioEs() {
  return (
    <>
      <HomeJsonLd lang="es" />
      <TxqSite urlLang="es" journal={latestJournal()} />
    </>
  );
}
