import type { Metadata } from "next";
import { readManifest } from "@/lib/photo-dump";
import { HERO_SLOTS, archiveSlot } from "@/lib/photo-dump-shared";
import { WORKS, workById } from "@/components/txq/data";
import { PhotosManager, type SlotRow } from "./PhotosManager";
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Photo dump" };

export default async function AdminPhotosPage() {
  await requireAdminPage("/admin/photos"); // server-side gate; middleware is not enough
  const read = await readManifest().catch(() => null);
  const heroA = workById("w01");
  const heroB = workById("w02");
  const slots: SlotRow[] = [
    { id: HERO_SLOTS[0], group: "Top of the homepage", label: "Big photo (left)", src: heroA.src, alt: heroA.alt.en },
    { id: HERO_SLOTS[1], group: "Top of the homepage", label: "Small photo (right)", src: heroB.src, alt: heroB.alt.en },
    ...WORKS.map((w, i) => ({
      id: archiveSlot(w.id),
      group: "Archive photos",
      label: `Photo ${String(i + 1).padStart(2, "0")} · ${w.subject}`,
      src: w.src,
      alt: w.alt.en,
    })),
  ];

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-24 pt-8 sm:px-8 md:pt-12 lg:px-16">
      <div className="border-b border-neutral-200 pb-7">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-950">Website / Photos</p>
        <h1 className="mt-3 text-[clamp(1.8rem,2.6vw,2.3rem)] font-medium tracking-[-0.04em] text-neutral-950">Photo dump</h1>
        <p className="mt-2 max-w-[60ch] text-base leading-7 text-neutral-950">
          Add as many photos as you like. They show up on the homepage under &ldquo;Latest photos&rdquo;, newest first, with any starred photos on top.
        </p>
      </div>
      <PhotosManager initial={read?.manifest ?? null} slots={slots} />
    </main>
  );
}
