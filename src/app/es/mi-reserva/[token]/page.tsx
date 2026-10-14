import { familyPageMetadata, renderFamilyPage } from "@/components/journey/route-page";

/** /es/mi-reserva/{token} — la página privada de la familia (español). */
export const dynamic = "force-dynamic";
export const metadata = familyPageMetadata("es");

export default function MiReservaPage(props: { params: Promise<{ token: string }>; searchParams: Promise<{ paid?: string }> }) {
  return renderFamilyPage("es", props.params, props.searchParams);
}
