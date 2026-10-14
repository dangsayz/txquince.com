import type { Metadata } from "next";
import { TxqSite } from "@/components/txq/TxqSite";

export const metadata: Metadata = {
  title: { absolute: "TX Quince — Quinceañera Photography & Film, Texas" },
  description:
    "Editorial quinceañera portraiture and cinema across Dallas–Fort Worth, Houston, Austin and San Antonio. Published commissions, bilingual from first call to final film.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <TxqSite />;
}
