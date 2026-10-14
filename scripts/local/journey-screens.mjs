#!/usr/bin/env node
/**
 * LOCAL ONLY — walk the whole client journey in a real browser against the
 * local stack (docs/DEMO-SCRIPT.md) and screenshot every state, EN + ES, at
 * 390px and 1440px. Fictional families, @example.com addresses, mail sink,
 * fake Stripe. Needs the `playwright` package (not a project dependency):
 *
 *   NODE_PATH=/opt/node-tools/node_modules OUT=/tmp/shots node scripts/local/journey-screens.mjs
 */
import { readFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

// ESM ignores NODE_PATH; resolve playwright from it (or PLAYWRIGHT_MODULE) explicitly.
const require = createRequire(import.meta.url);
const pwPath = process.env.PLAYWRIGHT_MODULE || require.resolve("playwright", { paths: (process.env.NODE_PATH || "").split(":").filter(Boolean) });
const { chromium } = require(pwPath);

const BASE = process.env.BASE || "http://127.0.0.1:3210";
const OUT = process.env.OUT || "./.local/journey";
mkdirSync(OUT, { recursive: true });
const env = Object.fromEntries(
  readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const REST = `${env.SUPABASE_URL}/rest/v1`;
const SR = env.SUPABASE_SERVICE_ROLE_KEY;
const rest = (path, init = {}) =>
  fetch(`${REST}${path}`, { ...init, headers: { apikey: SR, authorization: `Bearer ${SR}`, "content-type": "application/json", prefer: "return=representation", ...(init.headers || {}) } }).then((r) => r.json());

const VIEWPORTS = [
  ["390", { width: 390, height: 844 }],
  ["1440", { width: 1440, height: 900 }],
];
const report = [];

async function shoot(page, name, url) {
  for (const [label, vp] of VIEWPORTS) {
    await page.setViewportSize(vp);
    if (url) await page.goto(url, { waitUntil: "networkidle" });
    else await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const file = `${OUT}/${name}-${label}.png`;
    await page.screenshot({ path: file, fullPage: true });
    report.push({ file, overflow });
    if (overflow > 0) console.warn(`!! horizontal overflow ${overflow}px on ${name} @${label}`);
  }
}

async function request(body) {
  const r = await fetch(`${BASE}/api/commission`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!j.ok) throw new Error(JSON.stringify(j));
  return j;
}
const base = (o) => ({
  city: "dfw",
  start_time: "6:00 PM",
  scope: "both",
  tier: "production",
  add_ons: ["sameday"],
  hours: 7,
  phone: "214-555-0100",
  share_permission: true,
  "cf-turnstile-response": "local",
  ...o,
});

const stamp = Date.now().toString(36);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
// `next dev` draws its own floating dev-tools badge; it isn't part of the site.
await ctx.addInitScript(() => {
  const hide = () => {
    const s = document.createElement("style");
    s.textContent = "nextjs-portal{display:none!important}";
    document.documentElement.appendChild(s);
  };
  if (document.documentElement) hide();
  else document.addEventListener("DOMContentLoaded", hide);
});
const page = await ctx.newPage();

// Admin login (fake GoTrue, fictional owner).
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "owner@example.com");
await page.fill('input[type="password"]', "local-demo-only");
await page.click('button[type="submit"]');
await page.waitForURL(/\/admin(\/|$)/, { timeout: 20000 });
const admin = (id, path, body) => page.request.post(`${BASE}/api/admin/bookings/${id}${path}`, { data: body }).then((r) => r.json());

for (const lang of ["en", "es"]) {
  const who =
    lang === "en"
      ? { name: "Rosa Martínez", honoree: "Valentina", email: `rosa.${stamp}@example.com`, event_date: "2027-04-17", venue: "Hacienda Las Flores (fictional)" }
      : { name: "Lucía Hernández", honoree: "Camila", email: `lucia.${stamp}@example.com`, event_date: "2027-05-15", venue: "Salón Jardín Real (ficticio)" };
  const year = lang === "en" ? 2027 : 2027;
  void year;
  const res = await request(base({ ...who, language: lang, note: lang === "en" ? "We'd love sunset photos outside." : "Nos encantaría tener fotos al atardecer." }));
  const link = res.link.replace(/^https?:\/\/[^/]+/, BASE);
  const [row] = await rest(`/bookings?select=id&email=eq.${encodeURIComponent(who.email)}`);
  const id = row.id;
  const L = `${lang}`;

  await shoot(page, `${L}-01-family-requested`, link);
  await admin(id, "", { action: "approve" });
  await shoot(page, `${L}-02-family-approved-sign`, link);

  // Sign in the UI: consent, typed name → signature, submit.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(link, { waitUntil: "networkidle" });
  await page.check('.tq-jr-sign input[type="checkbox"]', { force: true });
  await page.click(".tq-sign__btn >> nth=0"); // "Use my typed name"
  await page.click('.tq-jr-sign button[type="submit"]');
  await page.waitForSelector(".tq-jr-steps li[data-done='true']", { timeout: 20000 });
  await shoot(page, `${L}-03-family-signed-pay-deposit`, link);

  // Pay the deposit through the (fake) hosted checkout.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(link, { waitUntil: "networkidle" });
  await Promise.all([page.waitForURL(/127\.0\.0\.1:54323\/pay\//), page.click(".tq-jr-pay button")]);
  await page.screenshot({ path: `${OUT}/${L}-04-fake-stripe-checkout-390.png`, fullPage: true });
  await Promise.all([page.waitForURL(/paid=1/), page.click("button")]);
  await page.waitForTimeout(800);
  await shoot(page, `${L}-05-family-booked`, link);

  // Family asks to change the time.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(link, { waitUntil: "networkidle" });
  await page.selectOption("#jr-kind", "change_time");
  await page.fill("#jr-body", lang === "en" ? "Could we start at 5:30 PM instead? Thank you!" : "¿Podemos empezar a las 5:30 PM? ¡Gracias!");
  await page.click('.tq-jr-form button[type="submit"]');
  await page.waitForTimeout(800);

  await shoot(page, `${L}-06-admin-record-booked`, `${BASE}/admin/bookings/${id}`);
  await admin(id, "/message", { body: lang === "en" ? "Yes — 5:30 PM works. See you then!" : "Sí — 5:30 PM funciona. ¡Nos vemos!" });
  await admin(id, "", { action: "send_balance_link" });

  // Balance by Zelle (owner records it) → paid in full.
  await admin(id, "/payment", { amountCents: 420000, method: "zelle", note: "Zelle from mom (fictional)" });
  await shoot(page, `${L}-07-family-paid-in-full`, link);

  // After the event: delivery fields + completed.
  await admin(id, "/delivery", {
    gallery_url: "https://gallery.example.com/valentina",
    video_url: "https://video.example.com/valentina",
    album_status: "printing",
    review_url: "https://g.page/r/example-review",
    delivery_note: lang === "en" ? "Your sneak peek is in the gallery. The full set is coming next week." : "Tu adelanto ya está en la galería. El resto llega la próxima semana.",
    notify: true,
  });
  await admin(id, "", { action: "complete" });
  await shoot(page, `${L}-08-family-delivery`, link);
  await shoot(page, `${L}-09-admin-record-completed`, `${BASE}/admin/bookings/${id}`);
}

// A few more fictional families so the list has every state.
const extra = [
  { name: "Ana Torres", email: `ana.${stamp}@example.com`, event_date: "2027-06-12", language: "en" },
  { name: "Beatriz Gómez", email: `bea.${stamp}@example.com`, event_date: "2027-07-10", language: "es" },
  { name: "Carmen Ruiz", email: `carmen.${stamp}@example.com`, event_date: "2027-08-14", language: "en" },
];
const ex = [];
for (const e of extra) ex.push(await request(base({ ...e, venue: "", honoree: "" })));
const exRows = await rest(`/bookings?select=id,email&email=in.(${extra.map((e) => e.email).join(",")})`);
const idOf = (email) => exRows.find((r) => r.email === email).id;
await admin(idOf(extra[1].email), "", { action: "approve" });
await admin(idOf(extra[2].email), "", { action: "decline", note: "We're already booked that weekend — so sorry." });
await shoot(page, `es-10-family-approved-sign-only`, ex[1].link.replace(/^https?:\/\/[^/]+/, BASE));
await shoot(page, `en-11-family-declined`, ex[2].link.replace(/^https?:\/\/[^/]+/, BASE));

await shoot(page, `admin-12-list-all`, `${BASE}/admin/bookings`);
await shoot(page, `admin-13-list-requests`, `${BASE}/admin/bookings?view=requests`);
await shoot(page, `admin-14-record-requested`, `${BASE}/admin/bookings/${idOf(extra[0].email)}`);
await shoot(page, `admin-15-contract-template`, `${BASE}/admin/bookings/contract`);
await shoot(page, `en-16-find-my-booking`, `${BASE}/my/booking`);
await shoot(page, `es-16-encuentra-tu-reservacion`, `${BASE}/es/mi-reserva`);

await browser.close();
console.log(JSON.stringify(report, null, 1));
const bad = report.filter((r) => r.overflow > 0);
console.log(bad.length ? `OVERFLOW on ${bad.length} shots` : "no horizontal overflow on any shot");
