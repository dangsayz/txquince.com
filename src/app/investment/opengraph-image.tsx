import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "TX Quince — Quinceañera collections from $2,500";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({
    eyebrow: "Investment",
    title: "Photo and film collections.",
  });
}
