import type { Metadata } from "next";
import { VideographerPage } from "@/components/VideographerPage";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Quinceañera Videographer in Dallas–Fort Worth",
  description: "Cinematic quinceañera video across Dallas–Fort Worth. See real films and choose video-only or photo and film collections from $1,800.",
  alternates: { canonical: "/quinceanera-videographer", languages: { "en-US": "/quinceanera-videographer", "es-MX": "/es/videografo-de-quinceaneras" } },
};
export default function Page() { return <VideographerPage locale="en" />; }
