/**
 * instagram.ts — SERVER-ONLY wiring for the homepage Instagram section.
 *
 *   getInstagramFeed()  → what the homepage renders (from R2, never from
 *                         Instagram). Empty on any problem: the section hides.
 *   getInstagramBucket() → R2 access for the hourly job
 *                         (/api/cron/instagram → instagram-sync.ts).
 *
 * Local development has no R2 binding: `next dev` (or INSTAGRAM_FIXTURE=1)
 * shows fixture posts made from the site's own photos, so the layout can be
 * worked on without a token. Fixture posts link to the real profile.
 */
import "server-only";
import { cache } from "react";
import { site } from "@/content/site";
import { IG_FEED_KEY, normalizeFeed, type IgPost, type InstagramTile } from "./instagram-shared";

export type { InstagramTile };
import type { IgBucket } from "./instagram-sync";

/** Widths /api/instagram/<id> produces (kept in step with that route). */
export const IG_TILE_WIDTHS = [384, 640, 1080] as const;

async function cfEnv(): Promise<Record<string, unknown> | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    return mod.getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getInstagramBucket(): Promise<IgBucket | null> {
  const env = await cfEnv();
  return (env?.PORTFOLIO as IgBucket | undefined) ?? null;
}

function useFixture(): boolean {
  return process.env.INSTAGRAM_FIXTURE === "1" || (process.env.NODE_ENV === "development" && process.env.INSTAGRAM_FIXTURE !== "0");
}

const tileOf = (p: IgPost): InstagramTile => ({
  ...p,
  src: `/api/instagram/${p.id}?w=640`,
  srcSet: IG_TILE_WIDTHS.map((w) => `/api/instagram/${p.id}?w=${w} ${w}w`).join(", "),
});

/** The latest posts for the homepage (newest first); [] hides the section. */
export const getInstagramFeed = cache(async (): Promise<InstagramTile[]> => {
  try {
    const bucket = await getInstagramBucket();
    if (!bucket) return useFixture() ? FIXTURE : [];
    const obj = await bucket.get(IG_FEED_KEY);
    if (!obj) return [];
    const feed = normalizeFeed(JSON.parse(await obj.text()));
    return feed ? feed.posts.map(tileOf) : [];
  } catch (err) {
    console.error("[instagram] could not read the stored feed:", err instanceof Error ? err.message : err);
    return [];
  }
});

/* ---------------- fixture (local development only) ---------------- */

const FIXTURE_PHOTOS: Array<[string, IgPost["kind"], string]> = [
  ["dance", "video", "Father–daughter dance in Fort Worth 💃 Full film coming soon. #quinceañera #dfwquince"],
  ["lilac-arch", "image", "Lilac everything for Valeria’s XV at a garden venue in Southlake."],
  ["stockyards", "carousel", "Portrait session in the Fort Worth Stockyards before the big day. #txquince"],
  ["shoe-ceremony", "image", "La ceremonia del zapato, one of our favorite traditions to photograph."],
  ["canal", "image", "Golden hour along the canals in Las Colinas ✨"],
  ["red-garden", "video", "Red gown, rose garden. Reel from Saturday’s session in Dallas."],
  ["gown-overhead", "image", ""],
  ["kimberly-reception", "carousel", "Kimberly’s reception: grand entrance, vals and the last dance of the night."],
  ["reception", "image", "Thank you to every family who trusted us this season. 2027 dates are open now."],
];

const FIXTURE: InstagramTile[] = FIXTURE_PHOTOS.map(([name, kind, caption], i) => ({
  id: `90000000000000${i}`,
  permalink: site.social.instagram,
  caption,
  kind,
  timestamp: new Date(Date.UTC(2026, 9, 30 - i * 3)).toISOString(),
  src: `/portfolio/${name}.webp`,
}));
