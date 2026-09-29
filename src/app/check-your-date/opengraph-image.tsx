import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Check your date with TX Quince — a personal reply";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({
    eyebrow: "Inquiries",
    title: "Check your quinceañera date.",
    footer: "A personal reply from the studio",
  });
}
