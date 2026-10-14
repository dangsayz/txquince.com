import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "TX Quince — Quinceañera photos & video in Dallas–Fort Worth";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({
    title: "Quinceañera photos & video for her day.",
  });
}
