/**
 * image-slot-admin.ts — SERVER-ONLY: the admin operations behind
 * /api/admin/images (list), /api/admin/images/[slot] (replace / adjust) and
 * /api/admin/images/[slot]/undo.
 *
 * Every handler re-checks the admin session itself (server guard rule): the
 * Replace button being hidden from visitors is a convenience, not the gate.
 */
import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminEmail } from "@/lib/require-admin";
import { devAdminBypass } from "@/lib/image-slot-dev";
import { getSlot, isSlotId, SLOTS, type SlotDef } from "@/lib/image-slots";
import {
  ALT_MAX,
  ALT_MIN,
  applyReplace,
  applyUndo,
  MAX_RENDITION_BYTES,
  renditionKey,
  renditionWidths,
  UndoError,
  versionKey,
  type SlotValue,
  type Version,
} from "@/lib/image-slot-state";
import { probeImage } from "@/lib/image-probe";
import {
  getAllSlotValues,
  getSlotBucket,
  readSlotValue,
  SlotStoreError,
  updateSlotValue,
} from "@/lib/image-slot-store";

/** The signed-in admin's email, or null. Never trusts the client. */
export async function slotAdmin(): Promise<string | null> {
  return devAdminBypass() ?? (await getAdminEmail());
}

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
const fail = (error: string, status: number) => json({ error }, status);

const unauthorized = () => fail("Please sign in to the studio first.", 401);

function slotOr400(slot: string): SlotDef | NextResponse {
  return isSlotId(slot) ? getSlot(slot)! : fail("Unknown image spot.", 400);
}

function revalidateSlot(def: SlotDef) {
  for (const p of new Set(def.paths.map((x) => x.split("#")[0] || "/"))) revalidatePath(p);
  if (def.id === "og.default") revalidatePath("/opengraph-image");
}

function storeError(err: unknown) {
  if (err instanceof UndoError) return fail(err.message, 409);
  if (err instanceof SlotStoreError) return fail(err.message, err.status);
  return fail("Something went wrong. Nothing was changed.", 500);
}

const newVersionId = () => `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;

const AltSchema = z.object({
  en: z.string().trim().min(ALT_MIN, "Describe the photo in English.").max(ALT_MAX, `Keep the English description under ${ALT_MAX} characters.`),
  es: z.string().trim().min(ALT_MIN, "Describe the photo in Spanish.").max(ALT_MAX, `Keep the Spanish description under ${ALT_MAX} characters.`),
});
const FocalSchema = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });

const MetaSchema = z.object({
  /** The original photo's size (after turning it the right way up). */
  w: z.number().int().positive().max(20000),
  h: z.number().int().positive().max(20000),
  alt: AltSchema,
  focal: FocalSchema,
});

const AdjustSchema = z.object({ alt: AltSchema, focal: FocalSchema });
const UndoSchema = z.object({ versionId: z.string().regex(/^(original|[a-z0-9-]{8,40})$/).optional() });

/* ------------------------------- GET list ----------------------------- */

export type SlotListItem = {
  id: string;
  group: string;
  page: string;
  label: string;
  crops: SlotDef["crops"];
  defaultSrc: string;
  defaultAlt: SlotDef["defaultAlt"];
  defaultWidth?: number;
  format?: "jpeg";
  current: Version | null;
  history: Version[];
};

export async function listSlots(): Promise<SlotListItem[]> {
  const values = await getAllSlotValues();
  return SLOTS.map((s) => {
    const v = values.get(s.id);
    return {
      id: s.id,
      group: s.group,
      page: s.page,
      label: s.label,
      crops: s.crops,
      defaultSrc: s.defaultSrc,
      defaultAlt: s.defaultAlt,
      defaultWidth: s.defaultWidth,
      format: s.format,
      current: v?.current ?? null,
      history: v?.history ?? [],
    };
  });
}

export async function handleList(): Promise<NextResponse> {
  if (!(await slotAdmin())) return unauthorized();
  return json({ slots: await listSlots() });
}

/* --------------------------- POST replace/adjust ---------------------- */

export async function handleReplace(request: Request, slot: string): Promise<NextResponse> {
  const admin = await slotAdmin();
  if (!admin) return unauthorized();
  const def = slotOr400(slot);
  if (def instanceof NextResponse) return def;

  const type = request.headers.get("content-type") ?? "";
  if (type.startsWith("application/json")) return adjust(request, def, admin);
  if (!type.startsWith("multipart/form-data")) return fail("Send the photo as a form upload.", 415);

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_RENDITION_BYTES * 4 + 512 * 1024) return fail("These photos are too large.", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("The upload could not be read. Try again.", 400);
  }
  let metaRaw: unknown;
  try {
    metaRaw = JSON.parse(String(form.get("meta") ?? ""));
  } catch {
    return fail("Missing photo details.", 400);
  }
  const meta = MetaSchema.safeParse(metaRaw);
  if (!meta.success) return fail(meta.error.issues[0]?.message ?? "Invalid photo details.", 400);
  const { w, h, alt, focal } = meta.data;

  // The server decides which widths exist: each target capped at the
  // original's width. A rendition wider than the original is refused.
  const widths = renditionWidths(w);
  const files: { w: number; bytes: ArrayBuffer }[] = [];
  let ext: "webp" | "jpg" | null = null;
  for (const rw of widths) {
    const file = form.get(`r${rw}`);
    if (!(file instanceof Blob)) return fail(`Missing the ${rw}px copy of the photo.`, 400);
    if (!["image/webp", "image/jpeg"].includes(file.type)) return fail("Photos must be WebP or JPEG.", 415);
    if (file.size <= 0 || file.size > MAX_RENDITION_BYTES) return fail("Each copy of the photo must be under 8 MB.", 413);
    const bytes = await file.arrayBuffer();
    const s = probeImage(bytes);
    if (!s || (s.type === "webp") !== (file.type === "image/webp")) return fail("This file is not a WebP or JPEG photo.", 415);
    if (s.width !== rw) return fail(`The ${rw}px copy is ${s.width}px wide.`, 400);
    if (Math.abs(s.height - Math.round((rw * h) / w)) > 2) return fail("The copies do not match the photo's shape.", 400);
    if (s.hasMetadata) return fail("The photo still has camera data (EXIF/GPS) in it.", 400);
    if (def.format === "jpeg" && s.type !== "jpeg") return fail("This spot needs JPEG copies (link previews can’t show WebP).", 415);
    const fileExt = s.type === "webp" ? "webp" : "jpg";
    if (ext && ext !== fileExt) return fail("All copies must be the same file type.", 400);
    ext = fileExt;
    files.push({ w: rw, bytes });
  }
  // Nothing beyond the expected copies (e.g. an upscaled extra width).
  for (const k of form.keys()) {
    if (k !== "meta" && !widths.some((rw) => `r${rw}` === k)) return fail("Unexpected file in the upload.", 400);
  }

  const bucket = await getSlotBucket();
  if (!bucket) return fail("Photo storage is not available here.", 503);

  const id = newVersionId();
  const key = versionKey(def.id, id);
  const contentType = ext === "jpg" ? "image/jpeg" : "image/webp";
  try {
    // Renditions are immutable and never deleted (undo needs them).
    await Promise.all(
      files.map((f) =>
        bucket.put(renditionKey(key, f.w, ext!), f.bytes, {
          httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
        }),
      ),
    );
  } catch {
    return fail("Could not store the photo. Try again.", 502);
  }

  const version: Version = {
    id,
    key,
    w,
    h,
    widths,
    ...(ext === "jpg" ? { ext: "jpg" as const } : {}),
    alt,
    focal,
    uploadedAt: new Date().toISOString(),
    uploadedBy: admin,
  };
  let value: SlotValue;
  try {
    value = await updateSlotValue(def.id, (v) => applyReplace(v, version));
  } catch (err) {
    return storeError(err);
  }
  revalidateSlot(def);
  return json({ value });
}

/** New description / focal point for the photo already showing (no upload). */
async function adjust(request: Request, def: SlotDef, admin: string): Promise<NextResponse> {
  const parsed = AdjustSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid details.", 400);
  let value: SlotValue;
  try {
    value = await updateSlotValue(def.id, (v) => {
      if (!v.current) throw new UndoError("Choose a new photo first — the original can only be replaced.");
      return applyReplace(v, {
        ...v.current,
        id: newVersionId(),
        alt: parsed.data.alt,
        focal: parsed.data.focal,
        uploadedAt: new Date().toISOString(),
        uploadedBy: admin,
      });
    });
  } catch (err) {
    return storeError(err);
  }
  revalidateSlot(def);
  return json({ value });
}

/* ------------------------------- POST undo ---------------------------- */

export async function handleUndo(request: Request, slot: string): Promise<NextResponse> {
  if (!(await slotAdmin())) return unauthorized();
  const def = slotOr400(slot);
  if (def instanceof NextResponse) return def;
  const body = request.headers.get("content-type")?.startsWith("application/json")
    ? await request.json().catch(() => null)
    : {};
  const parsed = UndoSchema.safeParse(body ?? {});
  if (!parsed.success) return fail("Invalid version.", 400);
  let value: SlotValue;
  try {
    value = await updateSlotValue(def.id, (v) => applyUndo(v, parsed.data));
  } catch (err) {
    return storeError(err);
  }
  revalidateSlot(def);
  return json({ value });
}

/** Fresh state of one slot (admin only). */
export async function handleGetOne(slot: string): Promise<NextResponse> {
  if (!(await slotAdmin())) return unauthorized();
  const def = slotOr400(slot);
  if (def instanceof NextResponse) return def;
  try {
    const value = await readSlotValue(def.id);
    const slotInfo: SlotListItem = {
      id: def.id,
      group: def.group,
      page: def.page,
      label: def.label,
      crops: def.crops,
      defaultSrc: def.defaultSrc,
      defaultAlt: def.defaultAlt,
      defaultWidth: def.defaultWidth,
      format: def.format,
      current: value.current,
      history: value.history,
    };
    return json({ slot: slotInfo, value });
  } catch (err) {
    return storeError(err);
  }
}
