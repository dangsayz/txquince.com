/**
 * home-places.ts — the cities the homepage "Where we work" row links to.
 *
 * Only cities that have a page in src/content/locations.ts are listed (so no
 * link can 404), biggest searches first. Pure data, safe on the server; the
 * pages pass the small result down so the client bundle never carries the
 * full city content.
 */
import { locations } from "@/content/locations";

export type HomeCity = { slug: string; city: string };

/** Display order; any city page not named here follows, in registry order. */
const ORDER = [
  "dallas",
  "fort-worth",
  "arlington",
  "irving",
  "grand-prairie",
  "garland",
  "plano",
  "frisco",
  "mckinney",
  "mansfield",
  "farmers-branch",
];

export function homeCities(): HomeCity[] {
  const rank = (slug: string) => {
    const i = ORDER.indexOf(slug);
    return i === -1 ? ORDER.length : i;
  };
  return [...locations]
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .map((l) => ({ slug: l.slug, city: l.city }));
}
