import type { Metadata } from "next";
import { commissionsFromLabel } from "@/content/commissions";
import { VideographerPage } from "@/components/VideographerPage";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Quinceañera Videographer in Dallas–Fort Worth",
  description: `Quinceañera videos across Dallas–Fort Worth: full-length videos in 4K, short trailers and short vertical videos for social media. See real videos; photo and video packages are published, from ${commissionsFromLabel}.`,
  alternates: { canonical: "/quinceanera-videographer", languages: { "en-US": "/quinceanera-videographer", "es-MX": "/es/videografo-de-quinceaneras" } },
};
export default function Page() { return <VideographerPage locale="en" />; }
