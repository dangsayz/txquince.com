import { familyPageMetadata, renderFamilyPage } from "@/components/journey/route-page";

/** /my/booking/{token} — the family's private booking page (English). */
export const dynamic = "force-dynamic";
export const metadata = familyPageMetadata("en");

export default function MyBookingPage(props: { params: Promise<{ token: string }>; searchParams: Promise<{ paid?: string }> }) {
  return renderFamilyPage("en", props.params, props.searchParams);
}
