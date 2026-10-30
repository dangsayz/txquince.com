import type { Metadata } from "next";
import { InquiryPage } from "@/components/InquiryPage";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Consulta tu Fecha para Foto y Video de Quinceañera",
  description: "Cuéntanos sobre su quinceañera. Confirmamos personalmente si tu fecha está disponible y respondemos tus preguntas.",
  alternates: { canonical: "/es/consulta", languages: languageAlternates("/check-your-date", "/es/consulta") },
  openGraph: { locale: OG_LOCALE.es },
};

export default async function ConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const date = (await searchParams).date;
  const initialDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  return <InquiryPage locale="es" initialDate={initialDate} />;
}
