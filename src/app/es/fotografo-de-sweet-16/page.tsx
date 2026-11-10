import type { Metadata } from "next";
import { Sweet16Page, sweet16Metadata } from "@/components/Sweet16Page";

export const revalidate = 3600;
export function generateMetadata(): Metadata {
  return sweet16Metadata("es");
}

export default function Page() {
  return <Sweet16Page locale="es" />;
}
