/**
 * "Our experience at this venue": only the owner may write it, the text is
 * cleaned, and the real SQL runs against SQLite with the real migration.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

let sqlite: DatabaseSync;
function fakeD1() {
  return {
    prepare(sql: string) {
      let args: unknown[] = [];
      const stmt = {
        bind(...values: unknown[]) {
          args = values.map((v) => (v === undefined ? null : v));
          return stmt;
        },
        async first() {
          return (sqlite.prepare(sql).get(...(args as never[])) as Record<string, unknown>) ?? null;
        },
        async all() {
          return { results: sqlite.prepare(sql).all(...(args as never[])), meta: { changes: 0 } };
        },
        async run() {
          const r = sqlite.prepare(sql).run(...(args as never[]));
          return { results: [], meta: { changes: Number(r.changes) } };
        },
      };
      return stmt;
    },
  };
}

const state = vi.hoisted(() => ({ email: null as string | null, revalidated: [] as string[] }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/d1", () => ({ getD1: async () => fakeD1(), requireD1: async () => fakeD1() }));
vi.mock("@/lib/require-admin", () => ({ getAdminEmail: async () => state.email, requireAdmin: async () => state.email !== null }));
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => void state.revalidated.push(p) }));

import { venues } from "@/content/venues";
import { cleanExperience, experienceText, paragraphs, SaveExperienceSchema } from "@/lib/venue-experience";
import { getVenueExperience } from "@/lib/venue-experience-db";

const slug = venues[0].slug;
const call = async (method: "PUT" | "DELETE", body: unknown) => {
  const mod = await import("@/app/api/admin/venue-experience/route");
  return mod[method](
    new Request("https://txquince.com/api/admin/venue-experience", {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
};

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(join(process.cwd(), "migrations/0008_venue_experience.sql"), "utf8"));
  state.email = null;
  state.revalidated = [];
});

describe("who may write", () => {
  it("refuses a visitor: nothing is saved", async () => {
    expect((await call("PUT", { slug, verdict: "poor", body_en: "Rude staff." })).status).toBe(401);
    expect((await call("DELETE", { slug })).status).toBe(401);
    expect(await getVenueExperience(slug)).toBeNull();
  });

  it("lets the owner save, replace and remove, and refreshes the pages", async () => {
    state.email = "owner@example.com";
    const res = await call("PUT", { slug, verdict: "great", body_en: "  The staff met us at the door.\n\n\n\nLoad-in was easy.  ", body_es: "" });
    expect(res.status).toBe(200);
    const saved = await getVenueExperience(slug);
    expect(saved).toMatchObject({ venue_slug: slug, verdict: "great", body_en: "The staff met us at the door.\n\nLoad-in was easy.", body_es: null });
    expect(state.revalidated).toContain(`/venues/${slug}`);

    await call("PUT", { slug, verdict: null, body_en: "Second visit was different.", body_es: "La segunda visita fue distinta." });
    expect(await getVenueExperience(slug)).toMatchObject({ verdict: null, body_en: "Second visit was different.", body_es: "La segunda visita fue distinta." });
    expect(sqlite.prepare("SELECT count(*) AS n FROM venue_experience").get()).toEqual({ n: 1 });

    expect((await call("DELETE", { slug })).status).toBe(200);
    expect(await getVenueExperience(slug)).toBeNull();
  });

  it("refuses an unknown venue, an empty text and a made-up verdict", async () => {
    state.email = "owner@example.com";
    expect((await call("PUT", { slug: "no-such-venue", verdict: null, body_en: "x" })).status).toBe(404);
    expect((await call("PUT", { slug, verdict: null, body_en: "   " })).status).toBe(400);
    expect((await call("PUT", { slug, verdict: "terrible", body_en: "x" })).status).toBe(400);
  });
});

describe("text rules", () => {
  it("cleans control characters and extra blank lines", () => {
    expect(cleanExperience("a\u0000b\r\n\r\n\r\n\r\nc  \n")).toBe("ab\n\nc");
    expect(SaveExperienceSchema.safeParse({ slug: "x", verdict: null, body_en: "y".repeat(6001) }).success).toBe(false);
  });

  it("shows Spanish when written, English otherwise, split into paragraphs", () => {
    const x = { venue_slug: slug, verdict: null, body_en: "One.\n\nTwo.", body_es: null, updated_at: "2026-11-09T00:00:00Z" };
    expect(experienceText(x, "es")).toEqual({ text: "One.\n\nTwo.", lang: "en" });
    expect(experienceText({ ...x, body_es: "Uno." }, "es")).toEqual({ text: "Uno.", lang: "es" });
    expect(paragraphs(x.body_en)).toEqual(["One.", "Two."]);
  });
});
