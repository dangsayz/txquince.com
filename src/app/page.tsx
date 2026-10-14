import type { Metadata } from "next";
import { TxqSite } from "@/components/txq/TxqSite";
import { latestJournal } from "@/components/txq/journal";
import { getCinemaFilms } from "@/components/txq/films";
import { HomeJsonLd } from "@/components/txq/HomeJsonLd";
import { PRICE_FLOOR_USD } from "@/lib/commission";
import { site } from "@/content/site";

const from = `$${PRICE_FLOOR_USD.toLocaleString("en-US")}`;

// Films come from the admin video library; admin edits revalidate at once.
export const revalidate = 3600;

export const metadata: Metadata = {
  // Leads with the highest-intent local phrase families type.
  title: { absolute: "Quinceañera Photographer & Videographer in Dallas–Fort Worth | TX Quince" },
  description: `Luxury quinceañera photography and film across Dallas–Fort Worth, from Highland Park to Southlake. Published commissions from ${from}, bilingual from first call to final film. Check your date live.`,
  alternates: { canonical: "/", languages: { "en-US": "/", "es-MX": "/es" } },
  openGraph: {
    title: "TX Quince — Quinceañera Photography & Film, Dallas–Fort Worth",
    description: `Editorial portraits and cinema for the quinceañera. Commissions from ${from}.`,
    url: site.url,
  },
};

export default async function HomePage() {
  return (
    <>
      <HomeJsonLd lang="en" />
      <TxqSite journal={latestJournal()} films={await getCinemaFilms()} />
    </>
  );
}
