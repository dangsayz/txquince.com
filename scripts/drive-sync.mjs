#!/usr/bin/env node
/**
 * drive-sync.mjs — turn new photos in the owner's shared Google Drive folder
 * into a "Latest photos" post on the homepage (via photo-dump-import.mjs).
 *
 *   Loose photos in the folder        → one post: "New photos · Oct 14"
 *   A sub-folder (e.g. "Sofía's XV")  → its own album, named after the folder
 *
 * Only photos whose Drive id isn't already in dump/manifest.json are taken,
 * so it's safe to run once or twice a day. The folder must be shared as
 * "Anyone with the link can view" — the listing and downloads use Drive's
 * public endpoints (no Google login or API key), through curl so the
 * environment's HTTPS proxy applies.
 *
 * AI-generated images (Midjourney-style exports named "walkawayy__…") are
 * skipped by default: "Latest photos" presents real quinceañeras, and
 * families shouldn't mistake generated images for client work. Pass
 * --include-generated to post them anyway.
 *
 * DRY RUN IS THE DEFAULT. Add --apply to download, resize and upload (needs
 * CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID for `wrangler r2 … --remote`).
 *
 *   node scripts/drive-sync.mjs [--folder <id>] [--per-post 12] [--tags party] [--include-generated] [--apply]
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const DEFAULT_FOLDER = "1CrJUJ9ix4NywbsZcbcvGjXYjU9-aJVo5";
const BUCKET = "txquince-portfolio";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif", ".heic", ".heif"]);

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const APPLY = argv.includes("--apply") && !argv.includes("--dry-run");
const FOLDER = arg("folder", DEFAULT_FOLDER);
const PER_POST = Math.max(1, Number(arg("per-post", 12)) || 12);
const TAGS = arg("tags", "");
const INCLUDE_GENERATED = argv.includes("--include-generated");
const GENERATED = /^walkawayy__/i;

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: opts.binary ? undefined : "utf8", maxBuffer: 1 << 30, ...opts });
  return r;
}

/** Public folder listing → [{ id, name, folder }] */
function listFolder(id) {
  const r = sh("curl", ["-sL", "--fail", `https://drive.google.com/embeddedfolderview?id=${id}`]);
  if (r.status !== 0) throw new Error(`Couldn't read the Drive folder ${id}. Is it shared as "Anyone with the link"?`);
  const html = r.stdout;
  const out = [];
  const re = /<div class="flip-entry" id="entry-([A-Za-z0-9_-]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?<div class="flip-entry-title">([^<]+)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const name = m[3].replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
    out.push({ id: m[1], name, folder: /\/drive\/folders\//.test(m[2]) });
  }
  return out;
}

/** Drive ids already imported (read the live manifest; none if it doesn't exist yet). */
function importedIds() {
  const r = sh("npx", ["wrangler", "r2", "object", "get", `${BUCKET}/dump/manifest.json`, "--remote", "--pipe"]);
  const ids = new Set();
  try {
    const m = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
    for (const a of m.albums ?? []) for (const p of a.photos ?? []) if (p.driveId) ids.add(p.driveId);
  } catch {
    /* no manifest yet */
  }
  return ids;
}

function download(id, dest) {
  const url = `https://drive.usercontent.google.com/download?id=${id}&export=download`;
  let r = sh("curl", ["-sL", "--fail", "-o", dest, "-w", "%{content_type}", url]);
  if (r.status !== 0) throw new Error(`download failed for ${id}`);
  if (/text\/html/.test(r.stdout)) {
    // Large files get a "can't scan for viruses" page; confirm and retry.
    const page = readFileSync(dest, "utf8");
    const uuid = /name="uuid" value="([^"]+)"/.exec(page)?.[1];
    r = sh("curl", ["-sL", "--fail", "-o", dest, "-w", "%{content_type}", `${url}&confirm=t${uuid ? `&uuid=${uuid}` : ""}`]);
    if (r.status !== 0 || /text\/html/.test(r.stdout)) throw new Error(`download needs confirmation for ${id}`);
  }
}

function post(files, titleEn, titleEs) {
  const dir = mkdtempSync(join(tmpdir(), "drive-sync-"));
  try {
    const ids = [];
    for (const f of files) {
      const safe = `${f.id}${extname(f.name).toLowerCase()}`;
      if (APPLY) download(f.id, join(dir, safe));
      else writeFileSync(join(dir, safe), "");
      ids.push({ name: safe, id: f.id });
    }
    writeFileSync(join(dir, "_ids.json"), JSON.stringify(ids));
    console.log(`\n${APPLY ? "Posting" : "Would post"} "${titleEn}" with ${files.length} photo(s): ${files.map((f) => f.name).join(", ")}`);
    if (!APPLY) return;
    const r = sh(
      "node",
      [
        "scripts/photo-dump-import.mjs",
        "--dir", dir,
        "--title-en", titleEn,
        "--title-es", titleEs,
        "--drive-ids", join(dir, "_ids.json"),
        "--source", "drive",
        ...(TAGS ? ["--tags", TAGS] : []),
        "--apply",
      ],
      { stdio: "inherit" },
    );
    if (r.status !== 0) throw new Error("photo-dump-import failed");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const isImage = (f) =>
  !f.folder && IMAGE_EXT.has(extname(f.name).toLowerCase()) && (INCLUDE_GENERATED || !GENERATED.test(f.name));
const now = new Date();
const day = (loc) => new Intl.DateTimeFormat(loc, { month: "short", day: "numeric", timeZone: "America/Chicago" }).format(now);

const done = importedIds();
const root = listFolder(FOLDER);
const fresh = root.filter((f) => isImage(f) && !done.has(f.id)).slice(0, PER_POST);
console.log(`Drive folder: ${root.length} item(s); ${done.size} photo(s) already on the site; ${fresh.length} new loose photo(s) this run.`);
if (fresh.length) post(fresh, `New photos · ${day("en-US")}`, `Fotos nuevas · ${day("es-MX")}`);

for (const sub of root.filter((f) => f.folder)) {
  const items = listFolder(sub.id).filter((f) => isImage(f) && !done.has(f.id)).slice(0, PER_POST);
  if (items.length) post(items, sub.name, sub.name);
}
if (!APPLY) console.log("\nDry run — nothing was downloaded or uploaded. Add --apply to post.");
