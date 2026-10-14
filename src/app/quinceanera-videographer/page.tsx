import type { Metadata } from "next";
import { commissionsFromLabel as FROM_TOKEN } from "@/content/commissions";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { VideographerPage } from "@/components/VideographerPage";

export const revalidate = 3600;
// Carries a price token (FROM_TOKEN); filled from the live book below.
const META: Metadata = {
  title: "Quinceañera Videographer in Dallas–Fort Worth",
  description: `Quinceañera videos across Dallas–Fort Worth: full-length videos in 4K, short trailers and short vertical videos for social media. See real videos; photo and video packages are published, from ${FROM_TOKEN}.`,
  alternates: { canonical: "/quinceanera-videographer", languages: { "en-US": "/quinceanera-videographer", "es-MX": "/es/videografo-de-quinceaneras" } },
};

export async function generateMetadata(): Promise<Metadata> {
  return fillDeep(META, await getPriceBook());
}
export default function Page() { return <VideographerPage locale="en" />; }
