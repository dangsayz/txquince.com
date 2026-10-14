/**
 * image-slot-state.ts — the stored shape of a slot override and the pure
 * transitions on it (replace, undo). No I/O: the store and the API call these.
 *
 * site_settings row: key `image:<slotId>`, value `{ current, history }`.
 *   current  the version the site shows, or null = the original photo
 *   history  the last HISTORY_LIMIT versions uploaded, newest first (it
 *            includes `current`), so the admin can step back to any of them.
 * Renditions in R2 are never deleted, so every version in history stays
 * servable.
 */
import { z } from "zod";

export {
  HISTORY_LIMIT,
  RENDITION_WIDTHS,
  MAX_RENDITION_BYTES,
  ALT_MIN,
  ALT_MAX,
  renditionWidths,
  versionKey,
  renditionKey,
  renditionUrl,
  SLOT_MEDIA_KEY_RE,
  focalPosition,
} from "@/lib/image-slot-shared";
import { HISTORY_LIMIT } from "@/lib/image-slot-shared";

const focal = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });

export const VersionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{8,40}$/),
  key: z.string().regex(/^slots\/[a-z0-9.-]+\/[a-z0-9-]{8,40}$/),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
  widths: z.array(z.number().int().positive()).min(1),
  /** File type of the renditions (WebP unless the browser could only make JPEG). */
  ext: z.enum(["webp", "jpg"]).optional(),
  alt: z.object({ en: z.string(), es: z.string() }),
  focal,
  uploadedAt: z.string(),
  uploadedBy: z.string(),
});
export type Version = z.infer<typeof VersionSchema>;

export const SlotValueSchema = z.object({
  current: VersionSchema.nullable(),
  history: z.array(VersionSchema),
});
export type SlotValue = z.infer<typeof SlotValueSchema>;

export const EMPTY_VALUE: SlotValue = { current: null, history: [] };

/** Parse a stored value defensively (a malformed row reads as "original"). */
export function parseSlotValue(raw: unknown): SlotValue {
  const parsed = SlotValueSchema.safeParse(raw);
  if (!parsed.success) return { current: null, history: [] };
  return parsed.data;
}

/** Show `v` from now on; it becomes the newest history entry. */
export function applyReplace(value: SlotValue, v: Version): SlotValue {
  const history = [v, ...value.history.filter((x) => x.id !== v.id)].slice(0, HISTORY_LIMIT);
  return { current: v, history };
}

export type UndoTarget = { versionId?: string | "original" };

export class UndoError extends Error {}

/**
 * Undo. With no target: step back to the version uploaded before the current
 * one (or to the original photo when there is none). With a version id: show
 * that version. With "original": show the page's own photo again.
 * History is kept, so undo can always be undone.
 */
export function applyUndo(value: SlotValue, target: UndoTarget = {}): SlotValue {
  const { versionId } = target;
  if (versionId === "original") return { current: null, history: value.history };
  if (versionId) {
    const v = value.history.find((x) => x.id === versionId);
    if (!v) throw new UndoError("That version is no longer saved.");
    return { current: v, history: value.history };
  }
  if (!value.current) throw new UndoError("This spot already shows the original photo.");
  const at = value.history.findIndex((x) => x.id === value.current!.id);
  const previous = at >= 0 ? value.history[at + 1] : value.history[0];
  return { current: previous ?? null, history: value.history };
}
