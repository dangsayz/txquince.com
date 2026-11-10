import type { Metadata } from "next";
import { InspoPlacePage, inspoMetadata } from "@/components/InspoPlacePage";
import { getInspoPlace } from "@/content/inspo-places";

export const revalidate = 3600;
const place = getInspoPlace("dreamhaus")!;

export function generateMetadata(): Metadata {
  return inspoMetadata(place, "en");
}

export default function Page() {
  return <InspoPlacePage place={place} lang="en" />;
}
