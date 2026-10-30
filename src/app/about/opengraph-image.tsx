import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "About TX Quince — quinceañera photos and video";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({
    eyebrow: "About",
    title: "How TX Quince works.",
  });
}
