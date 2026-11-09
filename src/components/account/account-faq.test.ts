import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/**
 * /account reuses homepage FAQ answers by position. If someone reorders the
 * FAQ in copy.ts, the account page must not silently show the wrong answers.
 */
describe("account page FAQ picks", () => {
  it("still point at the questions they were chosen for", async () => {
    const { COPY } = await import("@/components/txq/copy");
    const { ACCOUNT_FAQ_PICKS } = await import("./AccountDashboard");
    const expected = ["deposit", "hours", "included together", "how many photographers", "when do we get", "sick", "post our photos", "spanish", "travel"];
    const qs = ACCOUNT_FAQ_PICKS.map((i) => COPY.en.faq.items[i]?.q.toLowerCase() ?? "");
    expect(qs.length).toBe(expected.length);
    qs.forEach((q, i) => expect(q, `pick ${i}`).toContain(expected[i]));
    for (const i of ACCOUNT_FAQ_PICKS) expect(COPY.es.faq.items[i]?.q, `es ${i}`).toBeTruthy();
  });
});
