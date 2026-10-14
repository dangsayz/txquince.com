/**
 * The image-slot API, called through the real route handlers with Supabase,
 * R2 and the auth session mocked. Covers the server guard (no session →
 * 401, before anything else runs), slot validation, the no-upscale and
 * no-EXIF guards, and replace → undo.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeJpeg, fakeWebp } from "@/lib/test-helpers/images";
import { renditionWidths } from "@/lib/image-slot-shared";

vi.mock("server-only", () => ({}));
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePath(...a) }));

/* ---- auth: the real requireAdmin → admin-auth path, with the session mocked ---- */
let sessionUser: { email: string } | null = null;
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: sessionUser } }) } }),
}));

/* ---- site_settings: an in-memory table with the PostgREST calls the store uses ---- */
type Row = { key: string; value: unknown; updated_at: string };
const table = new Map<string, Row>();

class Query {
  private filters: [string, string, unknown][] = [];
  private op: { kind: "select" } | { kind: "insert"; row: Row } | { kind: "update"; vals: Partial<Row> } = { kind: "select" };
  select() {
    return this;
  }
  insert(row: Row) {
    this.op = { kind: "insert", row };
    return this;
  }
  update(vals: Partial<Row>) {
    this.op = { kind: "update", vals };
    return this;
  }
  eq(col: string, v: unknown) {
    this.filters.push(["eq", col, v]);
    return this;
  }
  like(col: string, v: unknown) {
    this.filters.push(["like", col, v]);
    return this;
  }
  private rows(): Row[] {
    return [...table.values()].filter((r) =>
      this.filters.every(([kind, col, v]) => {
        const field = (r as Record<string, unknown>)[col];
        return kind === "eq" ? field === v : String(field).startsWith(String(v).replace(/%$/, ""));
      }),
    );
  }
  private run(): { data: unknown; error: unknown } {
    if (this.op.kind === "insert") {
      if (table.has(this.op.row.key)) return { data: null, error: { code: "23505" } };
      table.set(this.op.row.key, structuredClone(this.op.row));
      return { data: { key: this.op.row.key }, error: null };
    }
    if (this.op.kind === "update") {
      const hit = this.rows()[0];
      if (!hit) return { data: null, error: null };
      Object.assign(hit, structuredClone(this.op.vals));
      return { data: { key: hit.key }, error: null };
    }
    return { data: this.rows().map((r) => structuredClone(r)), error: null };
  }
  async maybeSingle() {
    const res = this.run();
    return { data: Array.isArray(res.data) ? (res.data[0] ?? null) : res.data, error: res.error };
  }
  then<T>(resolve: (v: { data: unknown; error: unknown }) => T) {
    return Promise.resolve(this.run()).then(resolve);
  }
}
vi.mock("@/lib/supabase-server", () => ({
  isSupabaseConfigured: () => true,
  getServiceSupabase: () => ({ from: () => new Query() }),
}));

/* ---- R2 ---- */
const objects = new Map<string, { bytes: Uint8Array<ArrayBuffer>; contentType?: string }>();
vi.mock("@/lib/r2-portfolio", () => ({
  getPortfolioBucket: async () => ({
    async put(key: string, value: ArrayBuffer, opts?: { httpMetadata?: { contentType?: string } }) {
      objects.set(key, { bytes: new Uint8Array(value), contentType: opts?.httpMetadata?.contentType });
    },
    async get(key: string) {
      const o = objects.get(key);
      return o ? { body: new Response(o.bytes).body, size: o.bytes.length, httpMetadata: { contentType: o.contentType } } : null;
    },
    async delete() {
      throw new Error("renditions must never be deleted");
    },
  }),
}));

const { POST: replace, GET: getOne } = await import("@/app/api/admin/images/[slot]/route");
const { POST: undo } = await import("@/app/api/admin/images/[slot]/undo/route");
const { GET: list } = await import("@/app/api/admin/images/route");
const { GET: session } = await import("@/app/api/admin/session/route");

const ctx = (slot: string) => ({ params: Promise.resolve({ slot }) });
const alt = { en: "Quinceañera under the oak trees", es: "Quinceañera bajo los robles" };

function uploadRequest(
  slot: string,
  { w = 1200, h = 800, files }: { w?: number; h?: number; files?: Record<string, Blob> } = {},
): Request {
  const form = new FormData();
  form.set("meta", JSON.stringify({ w, h, alt, focal: { x: 0.3, y: 0.25 } }));
  const all =
    files ??
    Object.fromEntries(
      renditionWidths(w).map((x) => [`r${x}`, new Blob([fakeWebp(x, Math.round((x * h) / w))], { type: "image/webp" })]),
    );
  for (const [k, v] of Object.entries(all)) form.set(k, v, `${k}.webp`);
  return new Request(`http://localhost/api/admin/images/${slot}`, { method: "POST", body: form });
}

const jsonRequest = (slot: string, body: unknown, path = "") =>
  new Request(`http://localhost/api/admin/images/${slot}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  table.clear();
  objects.clear();
  revalidatePath.mockClear();
  process.env.ADMIN_EMAILS = "owner@example.com";
  sessionUser = { email: "owner@example.com" };
});

describe("without an admin session", () => {
  it("refuses every call with 401 and writes nothing", async () => {
    sessionUser = null;
    process.env.TXQ_DEV_ADMIN_BYPASS = "1"; // the dev bypass is dead outside `next dev`
    try {
      expect((await replace(uploadRequest("home.hero.a"), ctx("home.hero.a"))).status).toBe(401);
      expect((await replace(jsonRequest("home.hero.a", { alt, focal: { x: 0, y: 0 } }), ctx("home.hero.a"))).status).toBe(401);
      expect((await undo(jsonRequest("home.hero.a", {}, "/undo"), ctx("home.hero.a"))).status).toBe(401);
      expect((await getOne(new Request("http://localhost"), ctx("home.hero.a"))).status).toBe(401);
      expect((await list()).status).toBe(401);
      expect(await (await session()).json()).toEqual({ admin: false });
      // An unknown slot is still 401 for a visitor (auth is checked first).
      expect((await replace(uploadRequest("nope.slot"), ctx("nope.slot"))).status).toBe(401);
    } finally {
      delete process.env.TXQ_DEV_ADMIN_BYPASS;
    }
    expect(table.size).toBe(0);
    expect(objects.size).toBe(0);
  });

  it("refuses a signed-in user who is not on the allowlist", async () => {
    sessionUser = { email: "someone@example.com" };
    expect((await replace(uploadRequest("home.hero.a"), ctx("home.hero.a"))).status).toBe(401);
    expect(table.size).toBe(0);
  });
});

describe("as the admin", () => {
  it("rejects an unknown slot with 400", async () => {
    const res = await replace(uploadRequest("home.nowhere"), ctx("home.nowhere"));
    expect(res.status).toBe(400);
    expect((await undo(jsonRequest("../../etc", {}, "/undo"), ctx("../../etc"))).status).toBe(400);
    expect(objects.size).toBe(0);
  });

  it("stores renditions under slots/<slot>/<version>-<w>.webp and revalidates the pages", async () => {
    const res = await replace(uploadRequest("home.hero.a"), ctx("home.hero.a"));
    expect(res.status).toBe(200);
    const { value } = await res.json();
    expect(value.current.widths).toEqual([480, 960, 1200]);
    expect(value.current.uploadedBy).toBe("owner@example.com");
    expect([...objects.keys()].sort()).toEqual(
      [480, 960, 1200].map((w) => `slots/home.hero.a/${value.current.id}-${w}.webp`).sort(),
    );
    expect(table.get("image:home.hero.a")).toBeTruthy();
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/es");
  });

  it("replace then undo restores the previous version (renditions are kept)", async () => {
    const first = await (await replace(uploadRequest("about.hero"), ctx("about.hero"))).json();
    const second = await (await replace(uploadRequest("about.hero", { w: 2000, h: 1000 }), ctx("about.hero"))).json();
    expect(second.value.current.id).not.toBe(first.value.current.id);
    const stored = objects.size;

    const back = await (await undo(jsonRequest("about.hero", {}, "/undo"), ctx("about.hero"))).json();
    expect(back.value.current.id).toBe(first.value.current.id);
    expect(objects.size).toBe(stored);

    const original = await (await undo(jsonRequest("about.hero", {}, "/undo"), ctx("about.hero"))).json();
    expect(original.value.current).toBeNull();
    expect((await undo(jsonRequest("about.hero", {}, "/undo"), ctx("about.hero"))).status).toBe(409);

    const byId = await (await undo(jsonRequest("about.hero", { versionId: second.value.current.id }, "/undo"), ctx("about.hero"))).json();
    expect(byId.value.current.id).toBe(second.value.current.id);
  });

  it("refuses a rendition wider than the original (no upscaling)", async () => {
    const files = {
      r480: new Blob([fakeWebp(480, 320)], { type: "image/webp" }),
      r960: new Blob([fakeWebp(960, 640)], { type: "image/webp" }),
      r1000: new Blob([fakeWebp(1000, 667)], { type: "image/webp" }),
      r1600: new Blob([fakeWebp(1600, 1067)], { type: "image/webp" }),
    };
    const res = await replace(uploadRequest("home.hero.a", { w: 1000, h: 667, files }), ctx("home.hero.a"));
    expect(res.status).toBe(400);
    expect(objects.size).toBe(0);
  });

  it("refuses a copy whose real pixels don't match its width", async () => {
    const files = {
      r480: new Blob([fakeWebp(480, 320)], { type: "image/webp" }),
      r960: new Blob([fakeWebp(1920, 1280)], { type: "image/webp" }),
      r1200: new Blob([fakeWebp(1200, 800)], { type: "image/webp" }),
    };
    expect((await replace(uploadRequest("home.hero.a", { files }), ctx("home.hero.a"))).status).toBe(400);
  });

  it("refuses photos that still carry EXIF/GPS, wrong types, and oversize files", async () => {
    const exif = { r480: new Blob([fakeWebp(480, 480, { exif: true })], { type: "image/webp" }) };
    expect((await replace(uploadRequest("home.hero.a", { w: 480, h: 480, files: exif }), ctx("home.hero.a"))).status).toBe(400);

    const svg = { r480: new Blob(["<svg/>"], { type: "image/svg+xml" }) };
    expect((await replace(uploadRequest("home.hero.a", { w: 480, h: 480, files: svg }), ctx("home.hero.a"))).status).toBe(415);

    const lying = { r480: new Blob([fakeJpeg(480, 480)], { type: "image/webp" }) };
    expect((await replace(uploadRequest("home.hero.a", { w: 480, h: 480, files: lying }), ctx("home.hero.a"))).status).toBe(415);

    const huge = new Uint8Array(8 * 1024 * 1024 + 1);
    huge.set(fakeWebp(480, 480));
    const big = { r480: new Blob([huge], { type: "image/webp" }) };
    expect((await replace(uploadRequest("home.hero.a", { w: 480, h: 480, files: big }), ctx("home.hero.a"))).status).toBe(413);
    expect(objects.size).toBe(0);
  });

  it("requires both alt texts", async () => {
    const form = new FormData();
    form.set("meta", JSON.stringify({ w: 480, h: 480, alt: { en: "A portrait", es: "" }, focal: { x: 0.5, y: 0.5 } }));
    form.set("r480", new Blob([fakeWebp(480, 480)], { type: "image/webp" }), "r480.webp");
    const res = await replace(new Request("http://localhost/x", { method: "POST", body: form }), ctx("home.hero.a"));
    expect(res.status).toBe(400);
  });

  it("stores the share-card slot as JPEG only", async () => {
    const webp = await replace(uploadRequest("og.default"), ctx("og.default"));
    expect(webp.status).toBe(415);
    const files = Object.fromEntries([480, 960, 1200].map((x) => [`r${x}`, new Blob([fakeJpeg(x, Math.round((x * 630) / 1200))], { type: "image/jpeg" })]));
    const ok = await replace(uploadRequest("og.default", { w: 1200, h: 630, files }), ctx("og.default"));
    expect(ok.status).toBe(200);
    expect((await ok.json()).value.current.ext).toBe("jpg");
  });

  it("adjusts the description and focal point without a new upload", async () => {
    expect((await replace(jsonRequest("home.hero.b", { alt, focal: { x: 0.1, y: 0.1 } }), ctx("home.hero.b"))).status).toBe(409);
    const up = await (await replace(uploadRequest("home.hero.b"), ctx("home.hero.b"))).json();
    const adj = await (await replace(jsonRequest("home.hero.b", { alt, focal: { x: 0.9, y: 0.2 } }), ctx("home.hero.b"))).json();
    expect(adj.value.current.key).toBe(up.value.current.key);
    expect(adj.value.current.focal).toEqual({ x: 0.9, y: 0.2 });
    const back = await (await undo(jsonRequest("home.hero.b", {}, "/undo"), ctx("home.hero.b"))).json();
    expect(back.value.current.focal).toEqual({ x: 0.3, y: 0.25 });
  });

  it("lists every slot with its state", async () => {
    await replace(uploadRequest("links.hero"), ctx("links.hero"));
    const { slots } = await (await list()).json();
    const links = slots.find((s: { id: string }) => s.id === "links.hero");
    expect(links.current.alt).toEqual(alt);
    expect(slots.find((s: { id: string }) => s.id === "home.hero.a").current).toBeNull();
    expect(await (await session()).json()).toEqual({ admin: true });
  });
});
