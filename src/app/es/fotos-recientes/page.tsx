import type { Metadata } from "next";
import { PhotoDumpPage } from "@/components/txq/PhotoDumpPage";
import { site } from "@/content/site";

// Lee el manifiesto de fotos en R2 en cada visita.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fotos Recientes de Quinceañera en Dallas–Fort Worth",
  description:
    "Las fotos de quinceañera más nuevas de TX Quince: retratos, la misa, la fiesta, la familia y los detalles de celebraciones recientes en Dallas–Fort Worth.",
  alternates: { canonical: "/es/fotos-recientes", languages: { "en-US": "/photos/latest", "es-MX": "/es/fotos-recientes" } },
  openGraph: {
    locale: "es_MX",
    title: "Fotos recientes de quinceañera · TX Quince",
    description: "Las fotos de quinceañera más nuevas de celebraciones recientes en Dallas–Fort Worth.",
    url: `${site.url}/es/fotos-recientes`,
  },
};

export default function FotosRecientesPage() {
  return <PhotoDumpPage lang="es" />;
}
