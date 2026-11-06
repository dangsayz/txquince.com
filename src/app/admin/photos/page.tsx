import type { Metadata } from "next";
import { StudioPage } from "@/components/admin/StudioPage";
import { readManifest } from "@/lib/photo-dump";
import { HERO_SLOTS } from "@/lib/photo-dump-shared";
import { HERO_PLATES } from "@/components/txq/data";
import { PhotosManager, type SlotRow } from "./PhotosManager";
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Photo dump" };

export default async function AdminPhotosPage() {
  await requireAdminPage("/admin/photos"); // server-side gate; middleware is not enough
  const read = await readManifest().catch(() => null);
  const heroA = HERO_PLATES.a;
  const heroB = HERO_PLATES.b;
  // Only the hero plates are swappable here; the homepage gallery is the real
  // portfolio (Admin → Portfolio), so it has no hand-placed frames to swap.
  const slots: SlotRow[] = [
    { id: HERO_SLOTS[0], group: "Top of the homepage", label: "Big photo (left)", src: heroA.src, alt: heroA.alt.en },
    { id: HERO_SLOTS[1], group: "Top of the homepage", label: "Small photo (right)", src: heroB.src, alt: heroB.alt.en },
  ];

  return (
    <StudioPage wide title="Photo dump" intro={<>Add as many photos as you like. They show on the homepage under &ldquo;Latest photos&rdquo;, newest first, starred photos on top.</>}>
      <PhotosManager initial={read?.manifest ?? null} slots={slots} />
    </StudioPage>
  );
}
