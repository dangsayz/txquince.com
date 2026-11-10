import { ogBase } from "@/lib/share-meta";
import type { Metadata } from "next";
import { BudgetPlanner } from "@/components/budget/BudgetPlanner";
import { site } from "@/content/site";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";
import { PT, fillDeep } from "@/lib/price-text";
import { getPriceBook } from "@/lib/pricing";

const title = "¿Qué Alcanza con tu Presupuesto?";
const description = `Escribe tu presupuesto para fotos y video de quinceañera y mira exactamente qué alcanza, desde ${PT.hours.moments} horas de la presentación hasta todo el día. O haznos una oferta.`;

const META: Metadata = {
  title,
  description,
  alternates: { canonical: "/es/presupuesto", languages: languageAlternates("/budget", "/es/presupuesto") },
  openGraph: { ...ogBase("es", { image: false }), title: `${title} · ${site.brand}`, description, url: `${site.url}/es/presupuesto`, type: "website", locale: OG_LOCALE.es },
  twitter: { card: "summary_large_image", title: `${title} · ${site.brand}`, description },
};

export async function generateMetadata(): Promise<Metadata> {
  // The description names the live Just the Moments hours; fill it from the price book.
  return fillDeep(META, await getPriceBook());
}

export default function PresupuestoPage() {
  return <BudgetPlanner />;
}
