import type { Metadata } from "next";
import { PhotoshootPage, photoshootMetadata } from "@/components/PhotoshootPage";

export const revalidate = 3600;
export const metadata: Metadata = photoshootMetadata("es");

export default function Page() {
  return <PhotoshootPage locale="es" />;
}
