import { describe, expect, it, vi, beforeEach } from "vitest";
import { escapeHtml } from "./html-escape";
import { jsonLdString } from "./json-ld";

vi.mock("server-only", () => ({}));

// Capture the HTML the email modules hand to Resend.
const sent = vi.hoisted(() => [] as { html: string }[]);
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: async (msg: { html: string }) => {
        sent.push(msg);
        return { data: { id: "test" }, error: null };
      },
    };
  },
}));

beforeEach(() => {
  sent.length = 0;
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("OPERATOR_NOTIFY_EMAIL", "owner@example.com");
});

describe("escapeHtml", () => {
  it("escapes &, <, >, double and single quotes", () => {
    expect(escapeHtml(`<a href="x" title='y'>Tom & Jerry</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;Tom &amp; Jerry&lt;/a&gt;",
    );
  });

  it("escapes & first, so entities are not double-decoded", () => {
    expect(escapeHtml("&quot;")).toBe("&amp;quot;");
  });
});

describe("email esc() in attribute context", () => {
  it("resend.ts: a phone number can't break out of href=\"tel:…\"", async () => {
    const { sendOperatorEmail } = await import("./resend");
    const r = await sendOperatorEmail({
      name: "Ana",
      email: "ana@example.com",
      phone: `555" onclick="alert(1)`,
      message: "hi",
    } as Parameters<typeof sendOperatorEmail>[0]);
    expect(r.ok).toBe(true);
    const html = sent[0]!.html;
    expect(html).toContain(`href="tel:555&quot; onclick=&quot;alert(1)"`);
    expect(html).not.toContain(`onclick="alert(1)"`);
  });

  // agreement-email.ts was replaced by the per-email modules in src/lib/emails/.
  it("emails/*: a name, note or link with quotes stays inside the text / attribute", async () => {
    const { declinedEmail } = await import("./emails/declined");
    const { html } = declinedEmail({
      lang: "en",
      name: `O'Brien" <b>x</b>`,
      eventDate: "2027-05-01",
      ref: "TXQ-000001",
      link: `https://txquince.com/my/booking/x" onclick="alert(1)`,
      reason: "<b>x</b>",
    });
    expect(html).toContain("O&#39;Brien&quot;");
    expect(html).not.toContain("<b>x</b>");
    expect(html).not.toContain(`onclick="alert(1)"`);
    expect(html).toContain(`x&quot; onclick=&quot;alert(1)`);
  });
});

describe("jsonLdString", () => {
  it("can't close the <script> element", () => {
    const out = jsonLdString({ name: `</script><script>alert(1)</script>` });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).toContain("\\u003c/script\\u003e");
  });

  it("parses back to exactly the same data", () => {
    const data = { a: "x < y && y > z", b: [1, "ñ", "line\u2028sep\u2029para"], c: { d: null } };
    expect(JSON.parse(jsonLdString(data))).toEqual(data);
    expect(jsonLdString(data)).not.toMatch(/[\u2028\u2029&]/);
  });
});
