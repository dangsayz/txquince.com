/**
 * ingest-venues.mjs — weekly venue-photo ingest.
 *
 * Reads full-res originals from ../media-inbox/<venue folder>/, optimizes each
 * (auto-rotate, resize ≤2200px long edge, WebP q80), uploads to the Supabase
 * `portfolio` bucket, and inserts a portfolio_images row tagged with its CITY
 * (so the /quinceanera-photographer/<city> page picks it up automatically) and
 * VENUE (alt + location, for local SEO). Raw video is ignored — films go to
 * YouTube.
 *
 * Idempotent: the slug is derived from the venue + original filename, so
 * re-running skips anything already ingested. Curates with a per-venue cap
 * (even spread across the shoot) so a 90-photo folder doesn't dump.
 *
 * Run:  node --env-file=.env.local scripts/ingest-venues.mjs [--cap N] [--dry]
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = path.join(ROOT, "media-inbox");
const BUCKET = "portfolio";
const LONG_EDGE = 2200;

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const capArg = args.indexOf("--cap");
const CAP = capArg >= 0 ? parseInt(args[capArg + 1], 10) : 8;

// Venue registry — SINGLE SOURCE OF TRUTH, shared with the app's venue landing
// pages (src/content/venues.ts reads the same file). Add a venue once here and
// its photos ingest AND its /venues/{slug} page appears. Each entry:
// { folder, citySlug (locations.ts slug, null = no city page), city, venue,
//   venueFull (woven into alt), section }.
const VENUES = Object.fromEntries(
  JSON.parse(readFileSync(path.join(ROOT, "src/content/venues.json"), "utf8")).map((v) => [
    v.folder,
    { citySlug: v.citySlug, city: v.city, venue: v.venue, venueFull: v.venueFull, section: v.section },
  ]),
);

const IMG_RE = /\.(jpe?g|png)$/i;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (run with --env-file=.env.local)");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function slugify(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/_/g, "-").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
}
// Noise tokens stripped from filenames so the permanent slug reads cleanly.
const NOISE = new Set(["12img", "txquince", "txquincesession", "quince", "quincea", "quinceanera", "era", "event", "session", "shoot", "img", "tx", "jpg", "jpeg"]);
function cleanStem(file) {
  const tokens = slugify(file.replace(IMG_RE, "").replace(/\.(jpe?g)$/i, "")).split("-").filter((t) => t && !NOISE.has(t));
  const out = [];
  for (const t of tokens) if (out[out.length - 1] !== t) out.push(t); // drop adjacent dupes
  return out.join("-");
}
// pick `cap` items spread evenly across the list (deterministic)
function spread(list, cap) {
  if (list.length <= cap) return list;
  const out = [];
  const step = list.length / cap;
  for (let i = 0; i < cap; i++) out.push(list[Math.floor(i * step)]);
  return out;
}

// existing slugs (idempotency)
const { data: existingRows, error: exErr } = await supabase.from("portfolio_images").select("slug");
if (exErr) { console.error("Could not read existing slugs:", exErr.message); process.exit(1); }
const existing = new Set((existingRows ?? []).map((r) => r.slug));

let ingested = 0, skipped = 0, maxSort = 500;
const report = [];

for (const [folder, meta] of Object.entries(VENUES)) {
  const dir = path.join(INBOX, folder);
  if (!existsSync(dir)) { report.push(`—  ${meta.city}/${meta.venue}: folder missing`); continue; }
  const all = (await readdir(dir)).filter((f) => IMG_RE.test(f) && !f.startsWith(".")).sort();
  if (!all.length) { report.push(`0  ${meta.city}/${meta.venue}: empty (awaiting photos)`); continue; }
  const chosen = spread(all, CAP);
  const venueSlug = slugify(meta.venue);
  let n = 0;
  for (const file of chosen) {
    const stem = cleanStem(file) || String(n);
    const slug = `${venueSlug}-${stem}`.slice(0, 80);
    if (existing.has(slug)) { skipped++; continue; }
    const src = path.join(dir, file);
    let buf, w, h;
    try {
      const pipe = sharp(src).rotate().resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 });
      buf = await pipe.toBuffer();
      const m = await sharp(buf).metadata();
      w = m.width; h = m.height;
    } catch (e) { console.error("optimize fail", file, e.message); continue; }
    const key = `${BUCKET}/venues/${meta.citySlug || "dfw"}/${slug}.webp`;
    const alt = `Quinceañera ${meta.section === "portraits" ? "portraits" : "celebration"} at ${meta.venueFull}, Texas`;
    const sizeKb = Math.round(buf.length / 1024);
    if (DRY) {
      report.push(`DRY ${meta.city}/${meta.venue} ${file} -> ${slug} (${w}x${h}, ${sizeKb}KB)`);
      existing.add(slug); n++; continue;
    }
    const up = await supabase.storage.from(BUCKET).upload(key, buf, { contentType: "image/webp", upsert: true });
    if (up.error) { console.error("upload fail", slug, up.error.message); continue; }
    const ins = await supabase.from("portfolio_images").insert({
      storage_path: key,
      alt,
      title: `${meta.venue}, ${meta.city}`,
      section: meta.section,
      city: meta.citySlug,
      location: meta.venueFull.replace(/^the /, ""),
      slug,
      width: w,
      height: h,
      is_feature: false,
      sort_order: maxSort++,
    });
    if (ins.error) {
      console.error("insert fail", slug, ins.error.message);
      await supabase.storage.from(BUCKET).remove([key]); // roll back the orphan
      continue;
    }
    existing.add(slug); ingested++; n++;
  }
  report.push(`${n}  ${meta.city}/${meta.venue}  [${all.length} available, cap ${CAP}]  city=${meta.citySlug ?? "(no page)"} section=${meta.section}`);
}

console.log(`\n${DRY ? "DRY RUN — no writes" : "INGEST COMPLETE"}`);
console.log(report.join("\n"));
console.log(`\nIngested: ${ingested}   Skipped (already in): ${skipped}`);
