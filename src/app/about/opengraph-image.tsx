import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "About TX Quince — reliable, bilingual quinceañera photography";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({
    eyebrow: "About",
    title: "Built around the families other vendors let down.",
  });
}
