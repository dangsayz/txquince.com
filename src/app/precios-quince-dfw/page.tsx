import { PriceGuidePage, priceGuideMetadata } from "@/components/plan/PriceGuidePage";

// Rows come from the database (edited at /admin/price-guide): render per request.
export const dynamic = "force-dynamic";

export function generateMetadata() {
  return priceGuideMetadata("es");
}

/** Spanish at the root path Spanish searchers type; the shell treats it as Spanish. */
export default function PreciosQuinceDfw() {
  return <PriceGuidePage lang="es" />;
}
