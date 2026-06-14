import { renderOg, ogSize, ogContentType } from "@/lib/og";
import { locations, getLocation } from "@/content/locations";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Fotógrafo de quinceañeras — Dallas–Fort Worth";

// Pre-render one card per city at build time (no runtime ImageResponse).
export function generateStaticParams() {
  return locations.map((l) => ({ city: l.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const loc = getLocation(city);
  const cityName = loc?.city ?? "Dallas–Fort Worth";
  return renderOg({
    eyebrow: `${cityName}, TX`,
    title: `Fotógrafo de Quinceañeras en ${cityName}`,
  });
}
