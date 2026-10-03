import type { Metadata } from "next";
import { EditorialHome } from "@/components/home/EditorialHome";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Fotografía y Video de Quinceañeras en Dallas–Fort Worth",
  description: "Fotos y video de quinceañera en Dallas–Fort Worth. Celebraciones reales y cuatro colecciones desde $1,800.",
  alternates: { canonical: "/es", languages: { "en-US": "/", "es-MX": "/es" } },
  openGraph: { locale: "es_MX" },
};

export default function InicioEs() {
  return <EditorialHome locale="es" />;
}
