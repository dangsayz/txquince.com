// One-off copy tool: live (self-hosted Supabase/PostgREST) → Cloudflare D1.
//
// Uploaded as a PREVIEW VERSION of the `txquince` worker (never deployed, no
// traffic) so it can use the site's existing SUPABASE_URL / service key
// secrets without anyone handling them. The D1 binding `DB` points at
// staging for the rehearsal and at production for the real switch-over.
//
// Customer data stays inside Cloudflare: responses carry only per-table
// counts and fingerprints. Every request needs the one-time MIGRATE_TOKEN.
//
//   POST /copy        wipe the D1 tables, copy every row, return counts
//   POST /copy?delta  NO wipe: add only rows D1 doesn't have yet (INSERT OR IGNORE),
//                     for the minutes between the full copy and the deploy
//   GET  /verify  compare Supabase vs D1: counts + fingerprint of ids
//
// See scripts/d1-move/README.md for the runbook.

const ORDER = [
  "inquiries",
  "inquiry_activity",
  "bookings",
  "quince_plans",
  "date_availability",
  "price_guide",
  "site_settings",
  "vendors",
  "portfolio_images",
  "portfolio_image_vendors",
  "videos",
  "venues",
  "conversion_changes",
  "page_views",
  "lead_events",
];
const KEY = {
  date_availability: "event_date",
  site_settings: "key",
  venues: "slug",
  portfolio_image_vendors: "image_id,vendor_id",
};
const PAGE = 1000;

function sb(env) {
  const base = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  return { base, h: { apikey: key, Authorization: `Bearer ${key}` } };
}

async function schema(env) {
  const { base, h } = sb(env);
  const spec = await (await fetch(`${base}/rest/v1/`, { headers: h })).json();
  return spec.definitions || {};
}

async function readAll(env, table) {
  const { base, h } = sb(env);
  const order = (KEY[table] || "id").split(",").map((c) => `${c}.asc`).join(",");
  const out = [];
  for (let offset = 0; ; offset += PAGE) {
    const r = await fetch(`${base}/rest/v1/${table}?select=*&order=${order}&offset=${offset}&limit=${PAGE}`, { headers: h });
    if (!r.ok) throw new Error(`${table}: read ${r.status}`);
    const rows = await r.json();
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
}

function convert(value, fmt) {
  if (value === null || value === undefined) return null;
  if (fmt === "timestamp with time zone" || fmt === "timestamp without time zone") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toISOString();
  }
  if (fmt === "jsonb" || fmt === "json" || (typeof fmt === "string" && fmt.endsWith("[]"))) return JSON.stringify(value);
  if (fmt === "boolean") return value ? 1 : 0;
  return value;
}

async function d1Columns(db, table) {
  const r = await db.prepare(`PRAGMA table_info(${table})`).all();
  return new Set(r.results.map((c) => c.name));
}

async function fingerprint(ids) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ids.sort().join("\n")));
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const idOf = (table, row) => (KEY[table] || "id").split(",").map((c) => String(row[c])).join("|");

async function copy(env, delta = false) {
  const defs = await schema(env);
  const db = env.DB;
  const report = {};
  // Wipe children first (foreign keys), then fill parents first.
  if (!delta) for (const t of [...ORDER].reverse()) await db.prepare(`DELETE FROM ${t}`).run();
  for (const t of ORDER) {
    if (!defs[t]) {
      report[t] = { skipped: "not in source" };
      continue;
    }
    const props = defs[t].properties || {};
    const cols = await d1Columns(db, t);
    const rows = await readAll(env, t);
    const missing = Object.keys(props).filter((c) => !cols.has(c));
    let inserted = 0;
    const errors = [];
    for (let i = 0; i < rows.length; i += 50) {
      const stmts = rows.slice(i, i + 50).map((row) => {
        const keys = Object.keys(row).filter((c) => cols.has(c));
        return db
          .prepare(`INSERT ${delta ? "OR IGNORE " : ""}INTO ${t} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`)
          .bind(...keys.map((k) => convert(row[k], props[k]?.format)));
      });
      try {
        await db.batch(stmts);
        inserted += stmts.length;
      } catch {
        // Retry one by one so a single bad row doesn't sink the batch; report it by id only.
        for (let j = 0; j < stmts.length; j++) {
          try {
            await stmts[j].run();
            inserted++;
          } catch (err) {
            errors.push({ id: idOf(t, rows[i + j]), error: String(err.message || err).slice(0, 160) });
          }
        }
      }
    }
    report[t] = { source: rows.length, inserted, missingColumns: missing, errors: errors.slice(0, 10), errorCount: errors.length };
  }
  return report;
}

async function verify(env) {
  const db = env.DB;
  const out = {};
  for (const t of ORDER) {
    const src = await readAll(env, t).catch(() => null);
    const keyCols = (KEY[t] || "id").split(",");
    const dst = await db.prepare(`SELECT ${keyCols.join(", ")} FROM ${t}`).all();
    const srcIds = src ? src.map((r) => idOf(t, r)) : [];
    const dstIds = dst.results.map((r) => idOf(t, r));
    out[t] = {
      source: src ? src.length : "unreadable",
      d1: dstIds.length,
      match: src !== null && srcIds.length === dstIds.length && (await fingerprint(srcIds)) === (await fingerprint(dstIds)),
    };
  }
  out.allMatch = Object.values(out).every((v) => v.match);
  return out;
}

export default {
  async fetch(req, env) {
    if (!env.MIGRATE_TOKEN || req.headers.get("x-migrate-token") !== env.MIGRATE_TOKEN) return new Response("no", { status: 404 });
    const { pathname } = new URL(req.url);
    try {
      if (pathname === "/copy" && req.method === "POST") return Response.json(await copy(env, new URL(req.url).searchParams.has("delta")));
      if (pathname === "/verify") return Response.json(await verify(env));
    } catch (err) {
      return Response.json({ error: String(err.message || err) }, { status: 500 });
    }
    return new Response("ok");
  },
};
