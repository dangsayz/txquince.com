import { PriceGuidePage, priceGuideMetadata } from "@/components/plan/PriceGuidePage";

// Rows come from the database (edited at /admin/price-guide): render per request.
export const dynamic = "force-dynamic";

export function generateMetadata() {
  return priceGuideMetadata("en");
}

export default function QuincePricesDfw() {
  return <PriceGuidePage lang="en" />;
}
