import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { makeHarness, jsonRequest, type Harness } from "./testing/harness";
import { makeRequest, params, sign, pay, adminAction } from "./testing/flow";
import { loadFamilyView, legacyRedirect } from "./family";
import { GET as contractGET } from "@/app/my/booking/[token]/contract/route";
import { POST as messagePOST } from "@/app/api/my/message/route";
import { POST as linkPOST } from "@/app/api/my/link/route";
import { newToken, hashToken } from "./tokens";
import type { JourneyDeps } from "./deps";

vi.mock("./tokens", async (orig) => {
  const real = await orig<typeof import("./tokens")>();
  return { ...real, hashesEqual: vi.fn(real.hashesEqual) };
});

describe("token isolation", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("token A only ever reads booking A; token B only B", async () => {
    const a = await makeRequest(h, { email: "ana@example.com", name: "Ana Fictional", event_date: "2027-05-01" });
    const b = await makeRequest(h, { email: "bea@example.com", name: "Bea Fictional", event_date: "2027-05-08" });
    const va = await loadFamilyView(h.deps as JourneyDeps, a.token);
    const vb = await loadFamilyView(h.deps as JourneyDeps, b.token);
    expect(va?.name).toBe("Ana Fictional");
    expect(va?.eventDate).toBe("2027-05-01");
    expect(vb?.name).toBe("Bea Fictional");
    expect(JSON.stringify(va)).not.toContain("bea@example.com");
  });

  it("A's token can't act on B: sign / pay / message / contract all 404 for a wrong token", async () => {
    const a = await makeRequest(h, { email: "ana@example.com", event_date: "2027-05-01" });
    await adminAction(h, a.id, "approve");
    const wrong = newToken();
    expect((await sign(wrong)).status).toBe(404);
    expect((await pay(wrong, "deposit")).status).toBe(404);
    const m = await messagePOST(jsonRequest("/api/my/message", { token: wrong, kind: "message", body: "hi" }));
    expect(m.status).toBe(404);
    const c = await contractGET(new Request("http://x"), params({ token: wrong }));
    expect(c.status).toBe(404);
    // and the real one still works
    expect((await sign(a.token)).status).toBe(200);
  });

  it("a wrong token is the same 404 (same body) whether it's malformed, unknown, revoked or expired", async () => {
    const a = await makeRequest(h);
    const bodies: string[] = [];
    for (const t of ["nope", newToken(), a.token]) {
      if (t === a.token) {
        // expire it
        const row = h.db.tokens.get(hashToken(t))!;
        row.expires_at = "2020-01-01T00:00:00Z";
      }
      const r = await sign(t);
      expect(r.status).toBe(404);
      bodies.push(JSON.stringify(r.json));
    }
    expect(new Set(bodies).size).toBe(1);
  });

  it("every lookup — hit or miss — goes through the constant-time compare", async () => {
    const { hashesEqual } = await import("./tokens");
    const spy = vi.mocked(hashesEqual);
    const a = await makeRequest(h);
    spy.mockClear();
    await loadFamilyView(h.deps as JourneyDeps, a.token);
    await loadFamilyView(h.deps as JourneyDeps, newToken());
    await loadFamilyView(h.deps as JourneyDeps, "short");
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("only the hash is stored, never the token", async () => {
    const a = await makeRequest(h);
    const all = JSON.stringify([...h.db.tokens.values(), ...h.db.bookings.values(), ...h.db.events]);
    expect(all).not.toContain(a.token);
    expect(h.db.tokens.has(hashToken(a.token))).toBe(true);
  });

  it("the family view never carries private fields", async () => {
    const a = await makeRequest(h);
    h.db.notes.push({ id: "n", booking_id: a.id, created_at: "x", author_email: "owner@example.com", body: "SECRET NOTE" });
    const v = await loadFamilyView(h.deps as JourneyDeps, a.token);
    const s = JSON.stringify(v);
    for (const leak of ["SECRET NOTE", "203.0.113.7", "price_book", "attribution", "owner@example.com", "cs_test"]) expect(s).not.toContain(leak);
  });

  it("old /booking/{id}?t= links: valid + fresh → new private link; wrong or stale → null (404)", async () => {
    const a = await makeRequest(h);
    await adminAction(h, a.id, "approve");
    const b = h.db.bookings.get(a.id)!;
    b.metadata = { ...b.metadata, agreement: { payToken: "legacy-pay-token-abcdef123456", approvedAt: h.now().toISOString() } };
    const url = await legacyRedirect(h.deps as JourneyDeps, a.id, "legacy-pay-token-abcdef123456");
    expect(url).toMatch(/^http:\/\/localhost:3210\/my\/booking\/[A-Za-z0-9_-]{43}$/);
    expect(await loadFamilyView(h.deps as JourneyDeps, url!.split("/").pop())).not.toBeNull();
    expect(await legacyRedirect(h.deps as JourneyDeps, a.id, "wrong")).toBeNull();
    expect(await legacyRedirect(h.deps as JourneyDeps, "not-a-uuid", "x")).toBeNull();
    h.setNow("2027-01-01T00:00:00Z"); // > 30 days after approval: pay token expired
    expect(await legacyRedirect(h.deps as JourneyDeps, a.id, "legacy-pay-token-abcdef123456")).toBeNull();
  });
});

describe('"Email me my link"', () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  const ask = async (email: string) => {
    const res = await linkPOST(new NextRequest(jsonRequest("/api/my/link", { email, lang: "en", "cf-turnstile-response": "ok" })));
    return { status: res.status, body: await res.text() };
  };

  it("answers identically for known and unknown emails, and mails only the stored address", async () => {
    await makeRequest(h, { email: "known@example.com" });
    const before = h.mail.length;
    const known = await ask("KNOWN@example.com");
    const unknown = await ask("nobody@example.com");
    expect(known).toEqual(unknown);
    expect(known.status).toBe(200);
    const sent = h.mail.slice(before);
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe("known@example.com");
    expect(sent[0]!.tag).toBe("magic-link");
    expect(sent[0]!.text).toMatch(/\/my\/booking\/[A-Za-z0-9_-]{43}/);
  });

  it("requires Turnstile", async () => {
    h.setTurnstile(false);
    expect((await ask("known@example.com")).status).toBe(403);
  });
});
