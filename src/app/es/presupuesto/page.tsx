import type { Metadata } from "next";
import { BudgetPlanner } from "@/components/budget/BudgetPlanner";
import { site } from "@/content/site";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

const title = "¿Qué Alcanza con tu Presupuesto?";
const description = "Escribe tu presupuesto para fotos y video de quinceañera y mira exactamente qué alcanza, desde 2 horas de la presentación hasta todo el día. O haznos una oferta.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/es/presupuesto", languages: languageAlternates("/budget", "/es/presupuesto") },
  openGraph: { title: `${title} · ${site.brand}`, description, url: `${site.url}/es/presupuesto`, type: "website", locale: OG_LOCALE.es },
  twitter: { card: "summary_large_image", title: `${title} · ${site.brand}`, description },
};

export default function PresupuestoPage() {
  return <BudgetPlanner />;
}
