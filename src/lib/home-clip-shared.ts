/**
 * home-clip-shared.ts — pure rules for the homepage's background film loops
 * (safe for client components and tests). Storage lives in home-clips.ts.
 */

/** Where a loop can play: the top of the homepage, and behind the featured-package card. */
export const HOME_CLIP_SLOTS = ["hero", "feature"] as const;
export type HomeClipSlot = (typeof HOME_CLIP_SLOTS)[number];

/** A background loop is short: 10 s of 1080p H.264 is 4–6 MB. */
export const MAX_CLIP_BYTES = 12 * 1024 * 1024;
/** Longer than this is a film, not a loop. */
export const MAX_CLIP_SECONDS = 20;

export type HomeClip = { name: string; size: number; updatedAt: string };
export type HomeClips = Partial<Record<HomeClipSlot, HomeClip>>;

/** The image slots that can also play a loop: "Replace photo" on the live page offers video there. */
export const CLIP_FOR_IMAGE_SLOT: Readonly<Record<string, HomeClipSlot>> = {
  "home.hero.a": "hero",
  "home.feature": "feature",
};

/** Where each loop plays, in the owner's words. */
export const CLIP_PLACE: Record<HomeClipSlot, string> = {
  hero: "at the top of the homepage",
  feature: "behind the featured package",
};

export const isHomeClipSlot = (v: unknown): v is HomeClipSlot =>
  typeof v === "string" && (HOME_CLIP_SLOTS as readonly string[]).includes(v);

/** True when the bytes start like an MP4/MOV container (`ftyp` box at byte 4). */
export function isMp4(head: Uint8Array): boolean {
  return head.length >= 12 && head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70;
}

/** A fresh file name per upload: clips are cached for a year, so names never repeat. */
export function clipName(slot: HomeClipSlot, now: number): string {
  return `${slot}-${now.toString(36)}.mp4`;
}

/** Public URL of a stored clip (the film route serves `home-film/<name>`). */
export const clipUrl = (name: string) => `/api/photos/film/${name}`;
