import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "TX Quince — Quinceañera portfolio across Dallas–Fort Worth";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({
    eyebrow: "Portfolio",
    title: "The day, kept exactly as it felt.",
  });
}
