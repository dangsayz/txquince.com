import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as schemas from "../src/lib/hero-cover.ts";
import * as focus from "../src/lib/hero-focus.ts";
import * as derivative from "../src/lib/image-derivative.ts";
import * as video from "../src/lib/video.ts";
import brandedImageLoader from "../src/lib/image-loader.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nativeRequire = createRequire(import.meta.url);
const revision = "2026-10-03T12:00:00.123+00:00";
const uploadPath = "portfolio/1791028800123-71fa6b69-7205-49f5-9267-ece9c276755d.webp";
const imageValue = { kind: "image", storage_path: "portfolio/original.webp", imageAlt: "Portrait in a rose gown", focusX: 0.54, focusY: 0.8 };
const imageRequest = (source = { kind: "upload", storagePath: uploadPath }, expectedUpdatedAt = revision) => ({ kind: "image", source, imageAlt: "Portrait in a silver gown", focusX: 0.3, focusY: 0.6, expectedUpdatedAt });

function compile(relativePath, mocks) {
  const filename = path.isAbsolute(relativePath) ? relativePath : path.join(root, relativePath);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => name in mocks ? mocks[name] : nativeRequire(name),
    process, Request, Response, ReadableStream, Date, console,
  }, { filename });
  return exports;
}

function harness(options = {}) {
  const state = {
    row: options.row === undefined ? { key: "hero_media", value: { ...imageValue }, updated_at: revision } : options.row,
    dbCalls: 0,
    writes: 0,
    inspections: 0,
    requestedKeys: [],
    revalidations: [],
  };
  const db = {
    from(table) {
      state.dbCalls++;
      let mode = "read";
      let payload;
      const conditions = {};
      const query = {
        select() { return query; },
        eq(key, value) { conditions[key] = value; return query; },
        insert(value) { mode = "insert"; payload = value; return query; },
        update(value) { mode = "update"; payload = value; return query; },
        delete() { mode = "delete"; return query; },
        async maybeSingle() {
          if (options.throwDb) throw new Error("private database connection string");
          if (table === "portfolio_images") return { data: options.libraryMissing ? null : { storage_path: "portfolio/library.webp" }, error: options.libraryError ? { code: "500" } : null };
          if (mode === "read") return { data: state.row, error: options.readError ? { code: "500" } : null };
          if (options.writeError) return { data: null, error: { code: "500", message: "private database detail" } };
          if (mode === "insert") {
            if (state.row) return { data: null, error: { code: "23505" } };
            state.row = payload;
          } else {
            if (options.race || !state.row || state.row.updated_at !== conditions.updated_at || state.row.key !== conditions.key) return { data: null, error: null };
            if (mode === "delete") { state.row = null; state.writes++; return { data: { key: "hero_media" }, error: null }; }
            state.row = { ...state.row, ...payload };
          }
          state.writes++;
          return { data: state.row, error: null };
        },
      };
      return query;
    },
  };
  const content = compile("src/lib/content-db.ts", {
    "server-only": {},
    react: { cache: (fn) => fn },
    "@/lib/supabase-server": { getServiceSupabase: () => db, isSupabaseConfigured: () => true },
    "@/content/venues": {},
    "@/lib/hero-focus": focus,
    "@/lib/hero-cover": schemas,
    "@/lib/image-derivative": derivative,
  });
  const route = compile(process.env.TXQUINCE_HERO_ROUTE_SOURCE || "src/app/api/admin/hero/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "next/cache": { revalidatePath: (value) => state.revalidations.push(value) },
    "@/lib/require-admin": { requireAdmin: async () => options.authorized !== false },
    "@/lib/admin-auth": { unauthorizedAdminResponse: () => Response.json({ error: "Unauthorized" }, { status: 401 }) },
    "@/lib/supabase-server": { getServiceSupabase: () => db },
    "@/lib/video": video,
    "@/lib/hero-focus": focus,
    "@/lib/content-db": content,
    "@/lib/hero-cover": schemas,
    "@/lib/r2-portfolio": { getPortfolioBucket: async () => options.noBucket ? null : { get: async (key) => { state.requestedKeys.push(key); return options.objectMissing ? null : { size: options.size ?? 800_000, body: new ReadableStream({ start(controller) { controller.close(); } }) }; } } },
    "@opennextjs/cloudflare": { getCloudflareContext: () => ({ env: options.noInspector ? {} : { IMAGES: { info: async () => { state.inspections++; if (options.invalidBytes) throw new Error("Invalid image bytes"); return options.info ?? { format: "image/webp", width: 3200, height: 2400 }; } } } }) },
  });
  const call = (method, body = {}) => route[method](new Request("https://txquince.com/api/admin/hero", { method: method === "GET" ? "GET" : method, ...(method === "GET" ? {} : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) }));
  return { state, content, route, call };
}

test("requires a known source, normalized finite anchors, and an explicit current revision", () => {
  assert.equal(schemas.HeroPublishSchema.safeParse(imageRequest()).success, true);
  for (const patch of [{ focusX: -0.1 }, { focusY: 1.01 }, { focusX: Infinity }, { focusY: NaN }, { expectedUpdatedAt: undefined }, { imageAlt: " " }, { source: { kind: "upload", storagePath: "portfolio/../secret.webp" } }, { source: { kind: "upload", storagePath: "https://example.com/image.jpg" } }, { source: { kind: "portfolio", slug: "../hero" } }, { imageUrl: "https://example.com/photo.jpg" }]) {
    assert.equal(schemas.HeroPublishSchema.safeParse({ ...imageRequest(), ...patch }).success, false);
  }
});

test("authenticates every hero operation before reading input or touching storage", async () => {
  for (const method of ["POST", "PATCH", "DELETE", "GET"]) {
    const { route, state } = harness({ authorized: false });
    const res = await route[method]({ json: () => { throw new Error("Body must remain unread"); } });
    assert.equal(res.status, 401);
    assert.equal(state.dbCalls, 0);
    assert.equal(state.requestedKeys.length, 0);
  }
});

test("publishes uploaded source and anchor together, with the same branded URL as the public reader", async () => {
  const { call, state, content } = harness();
  const res = await call("POST", imageRequest());
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(state.writes, 1);
  assert.equal(state.row.value.storage_path, uploadPath);
  assert.equal(state.row.value.imageUrl, undefined);
  assert.equal(state.row.value.focusX, 0.3);
  assert.equal(state.row.value.focusY, 0.6);
  assert.equal(state.row.value.width, 3200);
  assert.equal(state.inspections, 1);
  assert.equal(body.value.imageUrl, (await content.getHeroMedia()).imageUrl);
  assert.match(body.value.imageUrl, /^\/api\/img\/hero\?v=[a-z0-9]+$/);
  assert.doesNotMatch(JSON.stringify(body), /storage_path|storage\/v1|1791028800123/);
  assert.deepEqual(state.revalidations, ["/", "/es", "/admin/hero"]);
});

test("resolves a portfolio slug on the server and publishes its own independent anchor", async () => {
  const { call, state } = harness();
  const res = await call("POST", imageRequest({ kind: "portfolio", slug: "silver-gown" }));
  assert.equal(res.status, 200);
  assert.equal(state.row.value.storage_path, "portfolio/library.webp");
  assert.deepEqual(state.requestedKeys, ["portfolio/library.webp"]);
  assert.equal(state.row.value.focusX, 0.3);
  assert.equal(state.row.value.focusY, 0.6);
  assert.equal(state.writes, 1);
});

test("does not accept arbitrary image URLs or an unknown library photo", async () => {
  const raw = harness();
  assert.equal((await raw.call("POST", { kind: "image", imageUrl: "https://example.com/image.jpg", imageAlt: "Photo" })).status, 400);
  assert.equal(raw.state.writes, 0);
  const missing = harness({ libraryMissing: true });
  assert.equal((await missing.call("POST", imageRequest({ kind: "portfolio", slug: "deleted" }))).status, 400);
  assert.equal(missing.state.writes, 0);
});

test("rejects missing, oversized, invalid, and unsupported images without changing the published cover", async () => {
  for (const options of [{ objectMissing: true }, { size: 20_000_001 }, { size: 0 }, { invalidBytes: true }, { info: { format: "image/svg+xml", width: 200, height: 200 } }, { info: { format: "jpeg", width: 0, height: 100 } }]) {
    const { call, state } = harness(options);
    const res = await call("POST", imageRequest());
    assert.equal(res.status, 400);
    assert.equal(state.writes, 0);
    assert.equal(state.row.value.storage_path, imageValue.storage_path);
    assert.equal(state.revalidations.length, 0);
  }
});

test("reports unavailable validation infrastructure without pretending to publish", async () => {
  for (const options of [{ noBucket: true }, { noInspector: true }]) {
    const { call, state } = harness(options);
    const res = await call("POST", imageRequest());
    assert.equal(res.status, 503);
    assert.equal(state.writes, 0);
    assert.match((await res.json()).error, /temporarily unavailable/);
  }
});

test("a stale revision cannot replace the image, video, focus, or reset a newer cover", async () => {
  const stale = "2026-10-03T11:00:00.000Z";
  for (const [method, payload] of [["POST", imageRequest(undefined, stale)], ["POST", { kind: "video", videoUrl: "https://youtu.be/dQw4w9WgXcQ", expectedUpdatedAt: stale }], ["PATCH", { focusX: 0.1, focusY: 0.2, expectedUpdatedAt: stale }], ["DELETE", { expectedUpdatedAt: stale }]]) {
    const { call, state } = harness();
    assert.equal((await call(method, payload)).status, 409);
    assert.equal(state.writes, 0);
    assert.equal(state.row.updated_at, revision);
  }
});

test("null revision creates an initial setting but cannot overwrite an existing one", async () => {
  const fresh = harness({ row: null });
  assert.equal((await fresh.call("POST", imageRequest(undefined, null))).status, 200);
  assert.equal(fresh.state.writes, 1);
  const existing = harness();
  assert.equal((await existing.call("POST", imageRequest(undefined, null))).status, 409);
  assert.equal(existing.state.writes, 0);
});

test("conditional focus updates detect a concurrent write after the current cover was read", async () => {
  const { call, state } = harness({ race: true });
  assert.equal((await call("PATCH", { focusX: 0.2, focusY: 0.3, expectedUpdatedAt: revision })).status, 409);
  assert.equal(state.writes, 0);
});

test("focus saves retain the source version, while image replacement changes it", async () => {
  const { call, content, state } = harness();
  const before = await content.getHeroMedia();
  const res = await call("PATCH", { focusX: 0.1, focusY: 0.9, expectedUpdatedAt: revision });
  assert.equal(res.status, 200);
  const focused = (await res.json()).value;
  assert.equal(focused.imageUrl, before.imageUrl);
  assert.equal(focused.focusX, 0.1);
  assert.equal(focused.focusY, 0.9);
  const replaced = await call("POST", imageRequest(undefined, state.row.updated_at));
  assert.equal(replaced.status, 200);
  assert.notEqual((await replaced.json()).value.imageUrl, before.imageUrl);
});

test("legacy imageUrl settings remain readable; canonical keys resolve without prefix guessing", async () => {
  const legacyUrl = "https://internal.example/storage/v1/object/public/portfolio/portfolio/legacy.jpg";
  const { content, state } = harness({ row: { key: "hero_media", value: { kind: "image", imageUrl: legacyUrl, focusX: 0.4, focusY: 0.6 }, updated_at: revision } });
  assert.equal(await content.getHeroRawImageUrl(), legacyUrl);
  assert.match((await content.getHeroMedia()).imageUrl, /^\/api\/img\/hero\?v=/);
  state.row.value = { kind: "image", storage_path: "imported/photo.webp" };
  assert.match(await content.getHeroRawImageUrl(), /\/storage\/v1\/object\/public\/portfolio\/imported\/photo.webp$/);
  assert.equal((await content.getHeroMedia()).focusX, 0.5);
});

test("network and database failures never show success or reveal internal details", async () => {
  for (const options of [{ writeError: true }, { throwDb: true }]) {
    const { call, state } = harness(options);
    const res = await call("POST", imageRequest());
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.ok, undefined);
    assert.doesNotMatch(body.error, /private database/);
    assert.equal(state.writes, 0);
    assert.equal(state.revalidations.length, 0);
  }
  const reset = harness({ writeError: true });
  assert.equal((await reset.call("DELETE", { expectedUpdatedAt: revision })).status, 500);
  assert.ok(reset.state.row);
});

test("a malformed stored photo cannot produce a successful focus update", async () => {
  const { call, state } = harness({ row: { key: "hero_media", value: { kind: "image" }, updated_at: revision } });
  assert.equal((await call("PATCH", { focusX: 0.2, focusY: 0.3, expectedUpdatedAt: revision })).status, 409);
  assert.equal(state.writes, 0);
});

test("versioned previews add a width without breaking the source query", () => {
  assert.equal(brandedImageLoader({ src: "/api/img/hero?v=abc", width: 1440 }), "/api/img/hero?v=abc&w=1440");
});

test("publishes video and resets only the revision the administrator reviewed", async () => {
  const { call, state, content } = harness();
  const videoRes = await call("POST", { kind: "video", videoUrl: "https://youtu.be/dQw4w9WgXcQ", expectedUpdatedAt: revision });
  assert.equal(videoRes.status, 200);
  const published = (await videoRes.json()).value;
  assert.equal(published.kind, "video");
  assert.equal(published.imageUrl, null);
  assert.equal(published.provider, "youtube");
  assert.equal(await content.getHeroRawImageUrl(), null);
  const reset = await call("DELETE", { expectedUpdatedAt: state.row.updated_at });
  assert.equal(reset.status, 200);
  assert.equal(state.row, null);
  assert.equal(state.writes, 2);
});

test("requires an explicit revision for reset and rejects an unembeddable video without changing the source", async () => {
  const { call, state } = harness();
  assert.equal((await call("DELETE")).status, 400);
  assert.equal((await call("POST", { kind: "video", videoUrl: "https://example.com/album", expectedUpdatedAt: revision })).status, 400);
  assert.equal(state.writes, 0);
  assert.equal(state.row.value.storage_path, imageValue.storage_path);
});
