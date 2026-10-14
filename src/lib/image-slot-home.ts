/**
 * The homepage's image slots, resolved on the server for the client sections
 * (Hero, Archive, Intake). Precedence per slot: an `image:<slot>` override →
 * the older Photo dump swap for the same spot (Admin → Photo dump) → the
 * built-in photograph.
 */
import "server-only";
import { SLOTS } from "@/lib/image-slots";
import { resolveSlots } from "@/lib/image-slot-store";
import type { ResolvedSlotImage, SlotFallback } from "@/lib/image-slot-resolve";
import type { HomeOverrides } from "@/lib/photo-dump-shared";

export const HOME_SLOT_IDS = SLOTS.filter((s) => s.id.startsWith("home.")).map((s) => s.id);

export async function resolveHomeSlots(dump: HomeOverrides = {}): Promise<Record<string, ResolvedSlotImage>> {
  const entries: Record<string, SlotFallback | undefined> = {};
  for (const id of HOME_SLOT_IDS) {
    const def = SLOTS.find((s) => s.id === id)!;
    const swap = dump[id];
    entries[id] = swap
      ? {
          src: swap.src,
          alt: { en: swap.alt.en || def.defaultAlt.en, es: swap.alt.es || def.defaultAlt.es },
          width: swap.w,
          height: swap.h,
          focus: "50% 40%",
        }
      : undefined;
  }
  return resolveSlots(entries);
}
