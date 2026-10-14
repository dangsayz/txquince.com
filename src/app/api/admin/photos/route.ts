/**
 * /api/admin/photos — the Photo dump's only writer (admin only).
 *
 *   GET    → the whole manifest (admin view, hidden items included)
 *   POST   multipart {file, w, h, albumId?, titleEn?, titleEs?}
 *            → store one resized photo; adds it to `albumId`, or makes a
 *              one-photo album when no album is given ("Single photos")
 *   POST   JSON {action:"createAlbum", title, caption?} → a new empty album
 *   PATCH  JSON {action, ...} → edit / reorder / hide / delete / feature /
 *            swap a homepage image (see `apply` below)
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import {
  getDumpBucket,
  ManifestError,
  mutateManifest,
  newId,
  readManifest,
  storePhotoObject,
} from "@/lib/photo-dump";
import {
  isDumpTag,
  isHomeSlot,
  KEY_RE,
  MAX_EDGE,
  type DumpAlbum,
  type DumpManifest,
  type DumpPhoto,
  type L,
} from "@/lib/photo-dump-shared";

export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Same-site only: a form on another site cannot change the photos. */
function crossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

async function guard(request: Request): Promise<Response | null> {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  if (crossSite(request)) return bad("Forbidden", 403);
  return null;
}

function refreshPages() {
  for (const p of ["/", "/es", "/photos/latest", "/es/fotos-recientes"]) {
    try {
      revalidatePath(p);
    } catch {
      /* not fatal */
    }
  }
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
function toL(v: unknown, max = 140): L {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return { en: text(o.en, max), es: text(o.es, max) };
}

function failure(error: unknown) {
  if (error instanceof ManifestError) return bad(error.message, 409);
  console.error("[admin/photos]", error);
  return bad("Something went wrong on the server. Please try again.", 500);
}

export async function GET(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  const read = await readManifest();
  if (!read) return bad("Photo storage is not available here.", 503);
  return NextResponse.json({ manifest: read.manifest }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  const bucket = await getDumpBucket();
  if (!bucket) return bad("Photo storage is not available here.", 503);

  try {
    // Create an empty album first, so a batch can fill it photo by photo.
    if ((request.headers.get("content-type") ?? "").includes("application/json")) {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      if (body.action !== "createAlbum") return bad("Unknown request.");
      const title = toL(body.title);
      const caption = toL(body.caption, 600);
      const album: DumpAlbum = {
        id: newId(),
        title,
        ...(caption.en || caption.es ? { caption } : {}),
        createdAt: new Date().toISOString(),
        source: "admin",
        photos: [],
      };
      await mutateManifest((m) => {
        m.albums.unshift(album);
      }, bucket);
      refreshPages();
      return NextResponse.json({ album });
    }

    if (Number(request.headers.get("content-length") || 0) > MAX_BYTES + 64 * 1024) {
      return bad("This photo is too large. Please try again.", 413);
    }
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!form || !(file instanceof Blob) || !file.size) return bad("Choose a photo to upload.");
    if (file.size > MAX_BYTES) return bad("This photo is too large. Please try again.", 413);
    let w = Math.round(Number(form.get("w")));
    let h = Math.round(Number(form.get("h")));
    if (!(w > 0 && h > 0 && w <= MAX_EDGE * 2 && h <= MAX_EDGE * 2)) return bad("This photo's size could not be read.");
    const albumId = text(form.get("albumId"), 64);
    const driveId = text(form.get("driveId"), 200);

    const stored = await storePhotoObject(bucket, await file.arrayBuffer());
    if (stored.w && stored.h) {
      w = stored.w;
      h = stored.h;
    }
    const photo: DumpPhoto = {
      id: stored.id,
      key: stored.key,
      w,
      h,
      alt: { en: "", es: "" },
      tags: [],
      ...(driveId ? { driveId } : {}),
      createdAt: new Date().toISOString(),
    };

    const { result: album } = await mutateManifest((m) => {
      if (albumId) {
        const target = m.albums.find((a) => a.id === albumId);
        if (!target) throw new ManifestError("That album was deleted. Start a new upload.");
        if (!target.photos.some((p) => p.id === photo.id)) target.photos.push(photo);
        return target;
      }
      const single: DumpAlbum = {
        id: `s${photo.id}`,
        title: { en: text(form.get("titleEn"), 140), es: text(form.get("titleEs"), 140) },
        createdAt: photo.createdAt,
        source: "admin",
        photos: [photo],
      };
      if (!m.albums.some((a) => a.id === single.id)) m.albums.unshift(single);
      return single;
    }, bucket).catch(async (error) => {
      await bucket.delete(stored.key).catch(() => {}); // don't leave an orphan
      throw error;
    });
    refreshPages();
    return NextResponse.json({ photo, albumId: album.id });
  } catch (error) {
    return failure(error);
  }
}

type Action = Record<string, unknown> & { action?: string };

/** Apply one edit to the manifest; returns object keys to delete afterwards. */
function apply(m: DumpManifest, body: Action): string[] {
  const albumOf = (id: unknown) => {
    const a = m.albums.find((x) => x.id === id);
    if (!a) throw new ManifestError("That album no longer exists. Reload the page.");
    return a;
  };
  const photoOf = (id: unknown) => {
    for (const a of m.albums) {
      const i = a.photos.findIndex((p) => p.id === id);
      if (i >= 0) return { album: a, photo: a.photos[i], index: i };
    }
    throw new ManifestError("That photo no longer exists. Reload the page.");
  };
  const move = <T,>(list: T[], from: number, delta: unknown) => {
    const to = from + (Number(delta) > 0 ? 1 : -1);
    if (to < 0 || to >= list.length) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
  };
  const dropOverrides = (keys: string[]) => {
    if (!m.overrides) return;
    for (const [slot, key] of Object.entries(m.overrides)) if (keys.includes(key)) delete m.overrides[slot];
  };

  switch (body.action) {
    case "album": {
      const a = albumOf(body.albumId);
      if (body.title !== undefined) a.title = toL(body.title);
      if (body.caption !== undefined) {
        const c = toL(body.caption, 600);
        if (c.en || c.es) a.caption = c;
        else delete a.caption;
      }
      if (typeof body.hidden === "boolean") {
        if (body.hidden) a.hidden = true;
        else delete a.hidden;
      }
      return [];
    }
    case "photo": {
      const { photo } = photoOf(body.photoId);
      if (body.alt !== undefined) photo.alt = toL(body.alt, 300);
      if (Array.isArray(body.tags)) photo.tags = [...new Set(body.tags.filter(isDumpTag))];
      for (const flag of ["featured", "hidden"] as const) {
        if (typeof body[flag] === "boolean") {
          if (body[flag]) photo[flag] = true;
          else delete photo[flag];
        }
      }
      return [];
    }
    case "moveAlbum": {
      move(m.albums, m.albums.indexOf(albumOf(body.albumId)), body.delta);
      return [];
    }
    case "movePhoto": {
      const { album, index } = photoOf(body.photoId);
      move(album.photos, index, body.delta);
      return [];
    }
    case "deletePhoto": {
      const { album, index, photo } = photoOf(body.photoId);
      album.photos.splice(index, 1);
      dropOverrides([photo.key]);
      return [photo.key];
    }
    case "deleteAlbum": {
      const a = albumOf(body.albumId);
      m.albums.splice(m.albums.indexOf(a), 1);
      const keys = a.photos.map((p) => p.key);
      dropOverrides(keys);
      return keys;
    }
    case "override": {
      const slot = text(body.slot, 60);
      if (!isHomeSlot(slot)) throw new ManifestError("Unknown picture spot.");
      m.overrides ??= {};
      if (body.key === null || body.key === "") {
        delete m.overrides[slot];
      } else {
        const key = text(body.key, 200);
        if (!KEY_RE.test(key) || !m.albums.some((a) => a.photos.some((p) => p.key === key))) {
          throw new ManifestError("That photo no longer exists. Reload the page.");
        }
        m.overrides[slot] = key;
      }
      if (!Object.keys(m.overrides).length) delete m.overrides;
      return [];
    }
    default:
      throw new ManifestError("Unknown change.");
  }
}

export async function PATCH(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  const bucket = await getDumpBucket();
  if (!bucket) return bad("Photo storage is not available here.", 503);
  const body = (await request.json().catch(() => null)) as Action | null;
  if (!body || typeof body !== "object") return bad("Unknown change.");
  try {
    const { manifest, result: removed } = await mutateManifest((m) => apply(m, body), bucket);
    if (removed.length) await bucket.delete(removed).catch(() => {}); // best-effort cleanup
    refreshPages();
    return NextResponse.json({ manifest });
  } catch (error) {
    return failure(error);
  }
}
