/**
 * cities/index.ts — city pages added Nov 2026, one file per city (location +
 * local content together). locations.ts and city-content.ts spread these in.
 */
import type { Location } from "@/content/locations";
import type { CityContent } from "@/content/city-content";
import * as mesquite from "./mesquite";
import * as balchSprings from "./balch-springs";
import * as carrollton from "./carrollton";
import * as lewisville from "./lewisville";
import * as allen from "./allen";
import * as anna from "./anna";
import * as melissa from "./melissa";
import * as duncanville from "./duncanville";
import * as desoto from "./desoto";
import * as cedarHill from "./cedar-hill";

const all = [mesquite, balchSprings, carrollton, lewisville, allen, anna, melissa, duncanville, desoto, cedarHill];

export const extraLocations: Location[] = all.map((c) => c.location);
export const extraCityContent: Record<string, CityContent> = Object.fromEntries(
  all.map((c) => [c.location.slug, c.content]),
);
