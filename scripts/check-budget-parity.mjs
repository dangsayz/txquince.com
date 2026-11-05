#!/usr/bin/env node
/**
 * check-budget-parity.mjs — fails (exit 1) when the deployed /budget and
 * /es/presupuesto disagree.
 *
 * Types the same budgets into both pages (photos only, then photos + video)
 * and compares what each one offers: the price, the hours and the photo
 * count. Then compares each city page's English and Spanish versions (every
 * dollar amount on the page must match).
 * Run it after each deploy or price change:
 *
 *   node scripts/check-budget-parity.mjs                 # https://txquince.com
 *   BASE_URL=http://localhost:3000 node scripts/check-budget-parity.mjs
 *
 * Needs Playwright (pre-installed in Claude's cloud sessions).
 */
import { createRequire } from "node:module";

// CommonJS require so a globally installed Playwright (NODE_PATH) is found too.
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = (process.env.BASE_URL || "https://txquince.com").replace(/\/$/, "");
const BUDGETS = ["450", "800", "1300", "1700", "2100", "2600", "3000", "3500", "10000"];
const PAGES = { en: "/budget", es: "/es/presupuesto" };
const CITIES = (process.env.CITIES || "irving,dallas,fort-worth").split(",");

/** The numbers a result shows, language-free: "$1,300 · 5.5 · 150+". */
function numbers(text) {
  const price = text.match(/\$[\d,]+/)?.[0] ?? "-";
  const hours = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|horas?)/i)?.[1] ?? "-";
  const photos = text.match(/(\d[\d,–-]*\+?)\s*(?:edited photos|fotos editadas)/i)?.[1] ?? "-";
  return `${price} · ${hours}h · ${photos}`;
}

async function readPage(page, path) {
  await page.goto(BASE + path, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  const out = {};
  const input = page.locator("input").first();
  const modes = page.locator('button, [role="radio"], label').filter({ hasText: /^(Photos|Fotos)$|^(Photos \+ video|Fotos \+ video)$/ });
  for (const mode of [0, 1]) {
    if ((await modes.count()) > mode) await modes.nth(mode).click();
    for (const b of BUDGETS) {
      await input.fill(b);
      await page.waitForTimeout(500);
      const main = await page.evaluate(() => document.querySelector("main")?.innerText.replace(/\s+/g, " ") ?? "");
      const m = main.match(/(?:What \$[\d,]+ covers|Lo que alcanza con \$[\d,]+)(.*?)(?:Choose this|Elegir este|Don't see your number|¿No ves tu número)/);
      out[`${mode ? "video" : "photos"} ${b}`] = m ? numbers(m[1]) : "(no result)";
    }
  }
  return out;
}

const launch = process.env.HTTPS_PROXY && !/localhost|127\.0\.0\.1/.test(BASE) ? { proxy: { server: process.env.HTTPS_PROXY } } : {};
const browser = await chromium.launch(launch);
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const en = await readPage(page, PAGES.en);
  const es = await readPage(page, PAGES.es);
  const bad = Object.keys(en).filter((k) => en[k] !== es[k]);
  for (const k of Object.keys(en)) console.log(`${bad.includes(k) ? "✗" : "✓"} ${k.padEnd(13)} EN ${en[k].padEnd(24)} ES ${es[k]}`);
  if (bad.length) {
    console.error(`\n${bad.length} mismatch(es) between ${PAGES.en} and ${PAGES.es} on ${BASE}.`);
    process.exitCode = 1;
  } else {
    console.log(`\n${PAGES.en} and ${PAGES.es} agree on ${BASE}.\n`);
  }

  // City pages: the English and Spanish versions must show the same prices.
  const dollars = async (path) => {
    await page.goto(BASE + path, { waitUntil: "load", timeout: 60000 });
    const t = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");
    return [...new Set(t.match(/\$[\d,]*\d/g) ?? [])].sort().join(" ");
  };
  for (const city of CITIES) {
    const a = await dollars(`/quinceanera-photographer/${city}`);
    const b = await dollars(`/es/fotografo-de-quinceaneras/${city}`);
    const ok = a === b;
    console.log(`${ok ? "✓" : "✗"} ${city}: ${ok ? a : `EN ${a}\n   ES ${b}`}`);
    if (!ok) process.exitCode = 1;
  }
} finally {
  await browser.close();
}
