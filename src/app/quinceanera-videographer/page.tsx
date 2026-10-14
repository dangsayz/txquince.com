import type { Metadata } from "next";
import { commissionsFromLabel } from "@/content/commissions";
import { VideographerPage } from "@/components/VideographerPage";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Quinceañera Videographer in Dallas–Fort Worth",
  description: `Cinematic quinceañera film across Dallas–Fort Worth: 4K features, teasers and vertical reels. See real films; photo and film commissions are published, from ${commissionsFromLabel}.`,
  alternates: { canonical: "/quinceanera-videographer", languages: { "en-US": "/quinceanera-videographer", "es-MX": "/es/videografo-de-quinceaneras" } },
};
export default function Page() { return <VideographerPage locale="en" />; }
