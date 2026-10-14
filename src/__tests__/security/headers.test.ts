import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";
import { buildCsp, securityHeaders } from "@/lib/security-headers";

const REQUIRED = [
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "X-Frame-Options",
  "Cross-Origin-Opener-Policy",
  "Content-Security-Policy-Report-Only",
];

describe("next.config headers()", () => {
  it("applies every security header to every route", async () => {
    expect(typeof nextConfig.headers).toBe("function");
    const rules = await nextConfig.headers!();
    const all = rules.find((r) => r.source === "/:path*");
    expect(all, "a rule matching every path").toBeDefined();
    const keys = all!.headers.map((h) => h.key);
    for (const k of REQUIRED) expect(keys).toContain(k);
    const get = (k: string) => all!.headers.find((h) => h.key === k)!.value;
    expect(get("X-Content-Type-Options")).toBe("nosniff");
    expect(get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(get("X-Frame-Options")).toBe("DENY");
    expect(get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(get("Strict-Transport-Security")).toMatch(/^max-age=\d{8,}/);
    for (const feature of ["camera=()", "microphone=()", "geolocation=()"]) {
      expect(get("Permissions-Policy")).toContain(feature);
    }
  });

  it("ships the CSP as Report-Only (not enforcing yet)", async () => {
    const rules = await nextConfig.headers!();
    const keys = rules.flatMap((r) => r.headers.map((h) => h.key));
    expect(keys).not.toContain("Content-Security-Policy");
  });
});

describe("buildCsp", () => {
  const csp = buildCsp();
  const directive = (name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

  it("forbids framing, plugins and base-tag hijacks", () => {
    expect(directive("frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive("object-src")).toBe("object-src 'none'");
    expect(directive("base-uri")).toBe("base-uri 'self'");
    expect(directive("form-action")).toBe("form-action 'self'");
  });

  it("allows exactly what the site loads", () => {
    expect(directive("script-src")).toContain("https://challenges.cloudflare.com");
    expect(directive("script-src")).toContain("https://static.cloudflareinsights.com");
    expect(directive("frame-src")).toContain("https://challenges.cloudflare.com");
    expect(directive("frame-src")).toContain("https://www.youtube-nocookie.com");
    expect(directive("frame-src")).toContain("https://player.vimeo.com");
    expect(directive("img-src")).toContain("https://i.ytimg.com");
    expect(directive("connect-src")).toContain("https://db.txquince.com");
    expect(directive("connect-src")).toContain("https://cloudflareinsights.com");
    expect(directive("script-src")).not.toContain("'unsafe-eval'");
    expect(csp).toContain("report-uri /api/csp-report");
  });

  it("adds configured Supabase / media origins (origin only, no paths)", () => {
    const c = buildCsp({ supabaseUrl: "https://sb.example.com/rest/v1", mediaBaseUrl: "https://cdn.example.com/media/" });
    expect(c).toContain("https://sb.example.com");
    expect(c).not.toContain("/rest/v1");
    expect(c).toContain("https://cdn.example.com");
  });

  it("only adds upgrade-insecure-requests when enforcing (ignored in Report-Only)", () => {
    expect(buildCsp()).not.toContain("upgrade-insecure-requests");
    expect(buildCsp({ enforce: true })).toContain("upgrade-insecure-requests");
  });

  it("dev mode allows eval and the HMR socket", () => {
    const dev = buildCsp({ dev: true });
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).toContain("ws:");
  });

  it("securityHeaders uses the same CSP", () => {
    const h = securityHeaders();
    expect(h.find((x) => x.key === "Content-Security-Policy-Report-Only")!.value).toBe(buildCsp());
  });
});
