import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "TX Quince — Quinceañera collections from $1,800";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({
    eyebrow: "Investment",
    title: "Collections built around one unrepeatable day.",
  });
}
