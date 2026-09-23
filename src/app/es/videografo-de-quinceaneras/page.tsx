import type { Metadata } from "next";
import { VideographerPage } from "@/components/VideographerPage";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Videógrafo de Quinceañeras en Dallas–Fort Worth",
  description: "Video de quinceañeras en Dallas–Fort Worth. Mira celebraciones reales y elige video o foto y video desde $1,800.",
  alternates: { canonical: "/es/videografo-de-quinceaneras", languages: { "en-US": "/quinceanera-videographer", "es-MX": "/es/videografo-de-quinceaneras" } },
  openGraph: { locale: "es_MX" },
};
export default function Page() { return <VideographerPage locale="es" />; }
