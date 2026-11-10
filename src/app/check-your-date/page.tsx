import { ogBase } from "@/lib/share-meta";
import type { Metadata } from "next";
import { InquiryPage } from "@/components/InquiryPage";
import { getVenue } from "@/content/venues";
import { site } from "@/content/site";
import { languageAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Check Your Date",
  description: "Ask TX Quince about your quinceañera date and photo or video coverage in Dallas–Fort Worth. We confirm availability personally; no payment is needed to inquire.",
  alternates: { canonical: "/check-your-date", languages: languageAlternates("/check-your-date", "/es/consulta") },
  openGraph: { ...ogBase("en", { image: false }),
    title: "Check Your Date · TX Quince",
    description: "Tell us about your celebration. We will confirm availability personally, with no payment needed to inquire.",
    url: site.url + "/check-your-date",
  },
};

export default async function CheckYourDatePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[]; venue?: string | string[] }>;
}) {
  const { date, venue } = await searchParams;
  const initialDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  // ?venue=<slug> from a venue page: only known venues prefill (no free text from the URL).
  const initialVenue = typeof venue === "string" ? (getVenue(venue)?.venueFull.replace(/^the /i, "") ?? "") : "";
  return <InquiryPage locale="en" initialDate={initialDate} initialVenue={initialVenue} />;
}
