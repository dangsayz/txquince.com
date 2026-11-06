import type { Metadata } from "next";
import { StudioPage } from "@/components/admin/StudioPage";
import { listSlots } from "@/lib/image-slot-admin";
import { requireAdminPage } from "@/lib/require-admin";
import { ImagesManager } from "./ImagesManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Every image" };

export default async function AdminImagesPage() {
  // Server guard: the slot list carries who uploaded what, admin eyes only.
  await requireAdminPage("/admin/images");
  const slots = await listSlots();

  return (
    <StudioPage wide title="Every image" intro={<>Every photo on the website, page by page. Press Replace to put in a new one; Undo goes back. You can also replace a photo right on the site while signed in.</>}>
      <ImagesManager slots={slots} />
    </StudioPage>
  );
}
