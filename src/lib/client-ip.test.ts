import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp } from "./client-ip";

const req = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("clientIp — production (Cloudflare)", () => {
  it("trusts CF-Connecting-IP", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(clientIp(req({ "cf-connecting-ip": "203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("ignores a forged X-Forwarded-For even when CF-Connecting-IP is present", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      clientIp(req({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "1.2.3.4, 203.0.113.7" })),
    ).toBe("203.0.113.7");
  });

  it("never falls back to X-Forwarded-For / X-Real-IP in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" }))).toBe("unknown");
  });

  it("accepts IPv6", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(clientIp(req({ "cf-connecting-ip": "2001:db8::1" }))).toBe("2001:db8::1");
  });

  it("rejects junk that isn't an address (no header injection into stored records)", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(clientIp(req({ "cf-connecting-ip": "<script>alert(1)</script>" }))).toBe("unknown");
    expect(clientIp(req({ "cf-connecting-ip": "1".repeat(100) }))).toBe("unknown");
  });
});

describe("clientIp — development", () => {
  it("falls back to the first X-Forwarded-For hop", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(clientIp(req({ "x-forwarded-for": " 198.51.100.4 , 10.0.0.1" }))).toBe("198.51.100.4");
  });

  it("then to X-Real-IP", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(clientIp(req({ "x-real-ip": "198.51.100.9" }))).toBe("198.51.100.9");
  });

  it("still prefers CF-Connecting-IP", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(clientIp(req({ "cf-connecting-ip": "203.0.113.1", "x-forwarded-for": "198.51.100.4" }))).toBe("203.0.113.1");
  });

  it("returns 'unknown' with no headers", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(clientIp(req({}))).toBe("unknown");
  });
});
