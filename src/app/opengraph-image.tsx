import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "TX Quince — Quinceañera photography & film in Dallas–Fort Worth";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({
    title: "Her quinceañera, remembered exactly as it felt.",
  });
}
