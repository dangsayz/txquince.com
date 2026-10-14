import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { canTransition, sourcesOf, STATUSES, TRANSITIONS, type Status } from "./state";
import { transition } from "./core";
import { makeHarness, type Harness } from "./testing/harness";
import { adminAction, makeRequest } from "./testing/flow";
import type { JourneyDeps } from "./deps";

describe("canTransition — every pair, allowed and forbidden", () => {
  const allowed: [Status, Status][] = Object.entries(TRANSITIONS).flatMap(([from, tos]) =>
    tos.map((to) => [from as Status, to] as [Status, Status]),
  );
  it.each(allowed)("%s → %s is allowed", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
    expect(sourcesOf(to)).toContain(from);
  });

  const forbidden: [Status, Status][] = STATUSES.flatMap((from) =>
    STATUSES.filter((to) => !TRANSITIONS[from].includes(to)).map((to) => [from, to] as [Status, Status]),
  );
  it.each(forbidden)("%s → %s is forbidden", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
    expect(sourcesOf(to)).not.toContain(from);
  });

  it("terminal states go nowhere", () => {
    expect(TRANSITIONS.completed).toEqual([]);
    expect(TRANSITIONS.refunded).toEqual([]);
  });
});

describe("guarded transition — the state predicate is in the UPDATE", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("refuses a move whose current state isn't a legal source, even when called directly", async () => {
    const { id } = await makeRequest(h);
    // requested → confirmed is not in the table.
    const r = await transition(h.deps as JourneyDeps, id, "any", "confirmed");
    expect(r).toEqual({ ok: false, reason: "state" });
    expect(h.db.bookings.get(id)!.status).toBe("requested");
  });

  it("a stale check can't win: the row moved on before the write", async () => {
    const { id } = await makeRequest(h);
    // The caller believed it was 'requested', but the owner declined meanwhile.
    h.db.bookings.get(id)!.status = "declined";
    const r = await transition(h.deps as JourneyDeps, id, ["requested"], "approved");
    expect(r.ok).toBe(false);
    expect(h.db.bookings.get(id)!.status).toBe("declined");
  });

  it("forbidden admin actions answer 409 and change nothing", async () => {
    const { id } = await makeRequest(h);
    expect((await adminAction(h, id, "complete")).status).toBe(409); // requested → completed
    expect((await adminAction(h, id, "approve")).status).toBe(200);
    expect((await adminAction(h, id, "approve")).status).toBe(409); // approved → approved
    expect((await adminAction(h, id, "send_balance_link")).status).toBe(409); // not booked yet
    expect(h.db.bookings.get(id)!.status).toBe("approved");
  });

  it("re-approving an expired hold fails cleanly when another family took the date", async () => {
    const a = await makeRequest(h);
    h.db.bookings.get(a.id)!.status = "expired";
    await makeRequest(h, { email: "lucia@example.com", name: "Lucia Fictional" });
    const r = await adminAction(h, a.id, "approve");
    expect(r.status).toBe(409);
    expect(r.json.code).toBe("date_taken");
  });
});
