#!/usr/bin/env node
/**
 * photo-dump-import.mjs — add a folder of photos to the site's "Photo dump"
 * (homepage "Latest photos") using only Cloudflare access. Same storage the
 * admin page (/admin/photos) writes:
 *
 *   txquince-portfolio/dump/<YYYY>/<MM>/<id>.webp   resized photos
 *   txquince-portfolio/dump/manifest.json           albums + photos list
 *
 * Each photo is turned upright (EXIF), shrunk to max 2560px on the long edge
 * (never enlarged), saved as WebP (q88, metadata stripped) with `sharp`, or
 * with Python PIL when sharp isn't installed. Photos whose Google Drive id is
 * already in the manifest are skipped, so a daily job can re-run safely.
 *
 * DRY RUN IS THE DEFAULT — it prints what it would do and writes nothing.
 * Add --apply to upload. Uploads go through `npx wrangler r2 object put
 * … --remote`, which needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID.
 *
 * Usage:
 *   node scripts/photo-dump-import.mjs --dir ./photos --title-en "Sofía's quince" \
 *     [--title-es "Los XV de Sofía"] [--caption-en "…"] [--caption-es "…"] \
 *     [--drive-ids ids.json] [--tags party,family] [--album-id <existing id>] \
 *     [--source drive|admin] [--limit 200] [--bucket txquince-portfolio] \
 *     [--apply | --dry-run] [--out-dir ./public] [--no-remote-read] [--resizer pil]
 *
 *   --drive-ids  JSON mapping file name → Drive file id, either
 *                {"IMG_0001.jpg": "1AbC…"} or [{"name": "IMG_0001.jpg", "id": "1AbC…"}]
 *   --out-dir    write to a local folder instead of R2 (e.g. ./public for
 *                `next dev`, which reads public/dump/ when R2 isn't there)
 *   --album-id   add to an existing album instead of creating a new one
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";

const MAX_EDGE = 2560;
const QUALITY = 88;
const MANIFEST_KEY = "dump/manifest.json";
const TAGS = ["portraits", "church", "party", "dress-session", "details", "family"];
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif", ".heic", ".heif"]);

/* ------------------------------- args ------------------------------- */

function parseArgs(argv) {
  const out = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const [k, inline] = a.slice(2).split(/=(.*)/s);
    if (inline !== undefined) out[k] = inline;
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) out[k] = argv[++i];
    else out.flags.add(k);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.flags.has("help") || !args.dir) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split("*/")[0]);
  process.exit(args.dir ? 0 : 1);
}

const APPLY = args.flags.has("apply") && !args.flags.has("dry-run");
const OUT_DIR = args["out-dir"] ? resolve(args["out-dir"]) : null;
const BUCKET = args.bucket || "txquince-portfolio";
const LIMIT = Math.max(1, Number(args.limit) || Infinity);
const titleEn = (args["title-en"] || "").trim().slice(0, 140);
const titleEs = (args["title-es"] || "").trim().slice(0, 140);
const captionEn = (args["caption-en"] || "").trim().slice(0, 600);
const captionEs = (args["caption-es"] || "").trim().slice(0, 600);
const tags = (args.tags || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
const badTags = tags.filter((t) => !TAGS.includes(t));
if (badTags.length) fail(`Unknown tag(s): ${badTags.join(", ")}. Use: ${TAGS.join(", ")}`);
if (!args["album-id"] && !titleEn && !titleEs) fail("Give the album a name with --title-en (and --title-es).");

const mode = OUT_DIR ? `local folder ${OUT_DIR}` : APPLY ? `R2 bucket ${BUCKET} (remote)` : `DRY RUN against ${BUCKET}`;
console.log(`\nPhoto dump import → ${mode}\n`);

function fail(msg) {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}

const id12 = () => randomBytes(6).toString("hex");

/* ----------------------------- storage ------------------------------ */

function wrangler(argv, { quiet = false } = {}) {
  const res = spawnSync("npx", ["--yes", "wrangler", ...argv], {
    encoding: "utf8",
    env: { ...process.env, WRANGLER_SEND_METRICS: "false", FORCE_COLOR: "0" },
    maxBuffer: 32 * 1024 * 1024,
  });
  const output = `${res.stdout || ""}\n${res.stderr || ""}`;
  if (!quiet && res.status !== 0) console.error(output.trim());
  return { ok: res.status === 0, output };
}

const work = join(tmpdir(), `photo-dump-${process.pid}-${id12()}`);
mkdirSync(work, { recursive: true });
process.on("exit", () => rmSync(work, { recursive: true, force: true }));

/** Returns {manifest, found}. Throws when the bucket can't be read at all. */
function readManifest() {
  if (OUT_DIR) {
    const p = join(OUT_DIR, MANIFEST_KEY);
    return existsSync(p) ? { manifest: JSON.parse(readFileSync(p, "utf8")), found: true } : { manifest: empty(), found: false };
  }
  if (args.flags.has("no-remote-read")) return { manifest: empty(), found: false };
  const file = join(work, `manifest-${id12()}.json`);
  const res = wrangler(["r2", "object", "get", `${BUCKET}/${MANIFEST_KEY}`, "--file", file, "--remote"], { quiet: true });
  if (res.ok && existsSync(file)) return { manifest: JSON.parse(readFileSync(file, "utf8")), found: true };
  if (/does not exist|NoSuchKey|not found|10007/i.test(res.output)) return { manifest: empty(), found: false };
  const err = new Error(res.output.trim().split("\n").slice(-6).join("\n"));
  err.code = "READ_FAILED";
  throw err;
}

function putObject(key, file, contentType, cacheControl) {
  if (OUT_DIR) {
    const dest = join(OUT_DIR, key);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(file));
    return;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = wrangler([
      "r2", "object", "put", `${BUCKET}/${key}`,
      "--file", file, "--remote",
      "--content-type", contentType,
      "--cache-control", cacheControl,
    ]);
    if (res.ok) return;
    console.warn(`  retry ${attempt}/3 for ${key}`);
  }
  throw new Error(`Upload failed for ${key}`);
}

function empty() {
  return { version: 1, updatedAt: new Date(0).toISOString(), albums: [] };
}

/* ------------------------------ resize ------------------------------ */

let sharp = null;
if (args.resizer !== "pil") {
  try {
    sharp = (await import("sharp")).default;
  } catch {
    sharp = null;
  }
}
const pilOk = !sharp && spawnSync("python3", ["-c", "import PIL"], { encoding: "utf8" }).status === 0;
if (!sharp && !pilOk) fail("Need either the `sharp` npm package or Python 3 with Pillow (pip install pillow).");
console.log(`Resizer: ${sharp ? "sharp" : "Python PIL"}`);

const PIL_SCRIPT = `
import sys
from PIL import Image, ImageOps
src, dst, edge, q = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src)
im = ImageOps.exif_transpose(im)
if im.mode not in ("RGB", "RGBA"):
    im = im.convert("RGB")
im.thumbnail((edge, edge), Image.LANCZOS)
im.save(dst, "WEBP", quality=q, method=5)
print(im.width, im.height)
`;

async function resize(src, dst) {
  if (sharp) {
    const info = await sharp(src, { failOn: "none" })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(dst);
    return { w: info.width, h: info.height };
  }
  const res = spawnSync("python3", ["-I", "-c", PIL_SCRIPT, src, dst, String(MAX_EDGE), String(QUALITY)], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(res.stderr.trim().split("\n").pop() || "PIL failed");
  const [w, h] = res.stdout.trim().split(/\s+/).map(Number);
  return { w, h };
}

/* ------------------------------ inputs ------------------------------ */

const dir = resolve(args.dir);
if (!existsSync(dir) || !statSync(dir).isDirectory()) fail(`Not a folder: ${dir}`);
const files = readdirSync(dir)
  .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()) && !f.startsWith("."))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (!files.length) fail(`No photos in ${dir}`);

const driveIds = new Map();
if (args["drive-ids"]) {
  const raw = JSON.parse(readFileSync(resolve(args["drive-ids"]), "utf8"));
  const entries = Array.isArray(raw)
    ? raw.map((r) => [r.name ?? r.file ?? r.filename, r.id ?? r.driveId])
    : Object.entries(raw);
  for (const [name, id] of entries) if (name && id) driveIds.set(basename(String(name)), String(id));
}

/* ------------------------------- run -------------------------------- */

let start;
try {
  start = readManifest();
} catch (e) {
  if (APPLY || OUT_DIR) fail(`Could not read ${MANIFEST_KEY}; nothing was changed.\n${e.message}`);
  console.warn(`! Could not read the live manifest (dry run continues as if empty):\n  ${e.message.split("\n").pop()}`);
  start = { manifest: empty(), found: false };
}
const known = new Set(start.manifest.albums.flatMap((a) => a.photos.map((p) => p.driveId).filter(Boolean)));
console.log(`Manifest: ${start.found ? `${start.manifest.albums.length} albums` : "none yet (will be created)"}`);
if (args["album-id"] && !start.manifest.albums.some((a) => a.id === args["album-id"])) {
  fail(`Album ${args["album-id"]} is not in the manifest.`);
}

const now = new Date();
const yyyy = now.getUTCFullYear();
const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
const added = [];
let skipped = 0;
let failed = 0;

for (const name of files) {
  if (added.length >= LIMIT) break;
  const driveId = driveIds.get(name);
  if (driveId && known.has(driveId)) {
    skipped++;
    console.log(`  skip  ${name} (Drive ${driveId} already added)`);
    continue;
  }
  const id = id12();
  const key = `dump/${yyyy}/${mm}/${id}.webp`;
  const out = join(work, `${id}.webp`);
  try {
    const { w, h } = await resize(join(dir, name), out);
    const kb = Math.round(statSync(out).size / 1024);
    const verb = OUT_DIR ? "write" : APPLY ? "put" : "would put";
    console.log(`  ${verb.padEnd(9)} ${BUCKET}/${key}  ${w}×${h}  ${kb} KB  ← ${name}`);
    if (APPLY || OUT_DIR) putObject(key, out, "image/webp", "public, max-age=31536000, immutable");
    added.push({
      id,
      key,
      w,
      h,
      alt: { en: "", es: "" },
      tags,
      ...(driveId ? { driveId } : {}),
      createdAt: new Date().toISOString(),
    });
    if (driveId) known.add(driveId);
  } catch (e) {
    failed++;
    console.error(`  FAIL  ${name}: ${e.message}`);
  } finally {
    rmSync(out, { force: true });
  }
}

if (!added.length) {
  console.log(`\nNothing new to add (${skipped} skipped, ${failed} failed).`);
  process.exit(failed ? 1 : 0);
}

/** Merge into a FRESH copy of the manifest (re-read right before writing). */
function merge(manifest) {
  const m = { version: 1, updatedAt: new Date().toISOString(), albums: [], ...manifest };
  m.version = 1;
  m.updatedAt = new Date().toISOString();
  const present = new Set(m.albums.flatMap((a) => a.photos.flatMap((p) => [p.key, p.driveId].filter(Boolean))));
  const fresh = added.filter((p) => !present.has(p.key) && !(p.driveId && present.has(p.driveId)));
  let album = args["album-id"] ? m.albums.find((a) => a.id === args["album-id"]) : null;
  if (album) {
    album.photos.push(...fresh);
  } else {
    album = {
      id: id12(),
      title: { en: titleEn, es: titleEs },
      ...(captionEn || captionEs ? { caption: { en: captionEn, es: captionEs } } : {}),
      createdAt: new Date().toISOString(),
      source: args.source === "admin" ? "admin" : args.source === "drive" || driveIds.size ? "drive" : "admin",
      photos: fresh,
    };
    m.albums = [album, ...m.albums];
  }
  return { m, album, fresh };
}

let final;
if (APPLY || OUT_DIR) {
  const latest = readManifest(); // re-read before write: keep edits made meanwhile
  final = merge(latest.manifest);
  const file = join(work, "manifest.out.json");
  writeFileSync(file, JSON.stringify(final.m));
  putObject(MANIFEST_KEY, file, "application/json", "no-store");
} else {
  final = merge(structuredClone(start.manifest));
  console.log(`  would put ${BUCKET}/${MANIFEST_KEY}  (${final.m.albums.length} albums)`);
}

console.log(
  `\n${APPLY || OUT_DIR ? "Done" : "Dry run done — re-run with --apply to upload"}: ` +
    `${final.fresh.length} photo(s) → album "${final.album.title.en || final.album.title.es}" (${final.album.id}); ` +
    `${skipped} skipped, ${failed} failed.`,
);
process.exit(failed ? 1 : 0);
