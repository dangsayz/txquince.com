import { ogBase } from "@/lib/share-meta";
import type { Metadata } from "next";
import { BudgetPlanner } from "@/components/budget/BudgetPlanner";
import { site } from "@/content/site";
import { languageAlternates } from "@/lib/hreflang";
import { PT, fillDeep } from "@/lib/price-text";
import { getPriceBook } from "@/lib/pricing";

const title = "What Does Your Budget Cover?";
const description = `Type your quinceañera photo and video budget and see exactly what it covers, from ${PT.hours.moments} hours of the presentation to the whole day. Or make us an offer.`;

const META: Metadata = {
  title,
  description,
  alternates: { canonical: "/budget", languages: languageAlternates("/budget", "/es/presupuesto") },
  openGraph: { ...ogBase("en", { image: false }), title: `${title} · ${site.brand}`, description, url: `${site.url}/budget`, type: "website" },
  twitter: { card: "summary_large_image", title: `${title} · ${site.brand}`, description },
};

export async function generateMetadata(): Promise<Metadata> {
  // The description names the live Just the Moments hours; fill it from the price book.
  return fillDeep(META, await getPriceBook());
}

export default function BudgetPage() {
  return <BudgetPlanner />;
}
