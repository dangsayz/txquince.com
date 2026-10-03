import type { Metadata } from "next";
import { InquiryPage } from "@/components/InquiryPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Check Your Date",
  description: "Ask TX Quince about your quinceañera date and photo or film coverage in Dallas–Fort Worth. We confirm availability personally; no payment is needed to inquire.",
  alternates: { canonical: "/check-your-date" },
  openGraph: {
    title: "Check Your Date · TX Quince",
    description: "Tell us about your celebration. We will confirm availability personally, with no payment needed to inquire.",
    url: site.url + "/check-your-date",
  },
};

export default async function CheckYourDatePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const date = (await searchParams).date;
  const initialDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  return <InquiryPage locale="en" initialDate={initialDate} />;
}
