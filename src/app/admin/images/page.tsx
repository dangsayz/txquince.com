import type { Metadata } from "next";
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
    <main className="mx-auto max-w-[90rem] px-4 pb-24 pt-8 text-[#111110] sm:px-8 md:pt-12 lg:px-16">
      <div className="border-b border-[#111110] pb-7">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em]">Website / Images</p>
        <h1 className="mt-3 text-[clamp(1.8rem,2.6vw,2.3rem)] font-medium tracking-[-0.04em]">Every image</h1>
        <p className="mt-2 max-w-[62ch] text-base leading-7">
          Every photo on the website, page by page. Tap <strong>Replace</strong> to put in a new photo; you can always go back with{" "}
          <strong>Undo</strong>. “Original” means the page is showing its own photo. You can also replace a photo right on the website
          while you are signed in — look for the “Replace photo” button.
        </p>
      </div>
      <ImagesManager slots={slots} />
    </main>
  );
}
