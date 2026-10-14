import { renderOg, ogSize, ogContentType } from "@/lib/og";
import { renderSlotOg } from "@/lib/og-slot";

export const alt = "TX Quince — Quinceañera photos & video in Dallas–Fort Worth";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  // The admin's link-preview photo (image slot og.default), else the text card.
  return (
    (await renderSlotOg("og.default")) ??
    renderOg({
      title: "Quinceañera photos & video for her day.",
    })
  );
}
