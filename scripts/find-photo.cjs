#!/usr/bin/env node
/**
 * find-photo.cjs — pick a published album photo by what it shows.
 *
 *   node scripts/find-photo.cjs cake            every photo whose description says "cake"
 *   node scripts/find-photo.cjs waltz father    all words must match
 *   node scripts/find-photo.cjs --cat the-court by category
 *   node scripts/find-photo.cjs --wide crown    landscape only (fills a blog cover)
 *
 * Reads src/content/albums/*.json (the photos already live on the site). Prints
 * the slug to put in a blog `image` block, the shape, and the description.
 * A photo with no description yet only matches by category.
 */
const fs = require("fs");
const path = require("path");

let wide = false;
let cat = null;
const words = [];
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--wide") wide = true;
  else if (args[i] === "--cat") cat = args[++i] ?? null;
  else words.push(args[i].toLowerCase());
}
if (!words.length && !cat) {
  console.log("Usage: node scripts/find-photo.cjs [--wide] [--cat <category>] <word> [word...]");
  process.exit(1);
}

const dir = path.join(__dirname, "..", "src", "content", "albums");
let hits = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const album = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  for (const [seq, w, h, category, alt = ""] of album.photos) {
    if (wide && w <= h) continue;
    if (cat && category !== cat) continue;
    const hay = `${alt} ${category} ${album.id}`.toLowerCase();
    if (!words.every((word) => hay.includes(word))) continue;
    hits += 1;
    const slug = `album-${album.id}-${String(seq).padStart(3, "0")}`;
    console.log(`${slug}  ${w > h ? "wide" : "tall"}  [${category}]  ${alt || "(no description yet)"}`);
  }
}
console.log(`\n${hits} photo(s). View one: https://txquince.com/api/img/<slug>?w=1200`);
