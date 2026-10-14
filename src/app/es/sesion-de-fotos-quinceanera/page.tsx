import type { Metadata } from "next";
import { PhotoshootPage, photoshootMetadata } from "@/components/PhotoshootPage";

export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> {
  return photoshootMetadata("es");
}

export default function Page() {
  return <PhotoshootPage locale="es" />;
}
