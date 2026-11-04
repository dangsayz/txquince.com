import type { Metadata } from "next";
import { BudgetPlanner } from "@/components/budget/BudgetPlanner";
import { site } from "@/content/site";
import { languageAlternates } from "@/lib/hreflang";

const title = "What Does Your Budget Cover?";
const description = "Type your quinceañera photo and video budget and see exactly what it covers, from 2 hours of the presentation to the whole day. Or make us an offer.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/budget", languages: languageAlternates("/budget", "/es/presupuesto") },
  openGraph: { title: `${title} · ${site.brand}`, description, url: `${site.url}/budget`, type: "website" },
  twitter: { card: "summary_large_image", title: `${title} · ${site.brand}`, description },
};

export default function BudgetPage() {
  return <BudgetPlanner />;
}
