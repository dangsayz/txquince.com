/**
 * /api/admin/inquiries PATCH + DELETE, called directly (no middleware): the
 * admin session, the same-site origin and the payload are checked by the
 * handler itself, and nothing is written when any of them fails.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const state = vi.hoisted(() => ({ admin: true, deleted: [] as string[], updated: [] as unknown[] }));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: async () => state.admin }));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    from: () => ({
      delete: () => ({
        eq: (_: string, id: string) => ({
          select: async () => {
            state.deleted.push(id);
            return { data: [{ id }], error: null };
          },
        }),
      }),
      update: (fields: unknown) => ({
        eq: () => ({
          select: () => ({
            single: async () => {
              state.updated.push(fields);
              return { data: { id: "x", status: "won" }, error: null };
            },
          }),
        }),
      }),
    }),
  }),
}));

import { DELETE, PATCH } from "@/app/api/admin/inquiries/route";

const ID = "204d1525-4901-47eb-8005-1403ec6b9136";
const req = (method: string, body: unknown, origin = "https://txquince.com") =>
  new Request("https://txquince.com/api/admin/inquiries", {
    method,
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  state.admin = true;
  state.deleted.length = 0;
  state.updated.length = 0;
});

describe("DELETE /api/admin/inquiries", () => {
  it("refuses a caller who isn't an admin, and deletes nothing", async () => {
    state.admin = false;
    const res = await DELETE(req("DELETE", { id: ID }));
    expect([401, 403]).toContain(res.status);
    expect(state.deleted).toEqual([]);
  });

  it("refuses a request from another site, and deletes nothing", async () => {
    const res = await DELETE(req("DELETE", { id: ID }, "https://evil.example"));
    expect(res.status).toBe(403);
    expect(state.deleted).toEqual([]);
  });

  it("refuses a malformed id", async () => {
    const res = await DELETE(req("DELETE", { id: "not-a-uuid" }));
    expect(res.status).toBe(400);
    expect(state.deleted).toEqual([]);
  });

  it("deletes exactly the inquiry asked for", async () => {
    const res = await DELETE(req("DELETE", { id: ID }));
    expect(res.status).toBe(200);
    expect(state.deleted).toEqual([ID]);
  });
});

describe("PATCH /api/admin/inquiries", () => {
  it("refuses a request from another site, and changes nothing (sibling guard)", async () => {
    const res = await PATCH(req("PATCH", { id: ID, status: "won" }, "https://evil.example"));
    expect(res.status).toBe(403);
    expect(state.updated).toEqual([]);
  });

  it("refuses an unknown status", async () => {
    const res = await PATCH(req("PATCH", { id: ID, status: "archived" }));
    expect(res.status).toBe(400);
    expect(state.updated).toEqual([]);
  });

  it("marks lost with a reason", async () => {
    const res = await PATCH(req("PATCH", { id: ID, status: "lost", lost_reason: "price" }));
    expect(res.status).toBe(200);
    expect(state.updated[0]).toMatchObject({ status: "lost", lost_reason: "price" });
  });
});
