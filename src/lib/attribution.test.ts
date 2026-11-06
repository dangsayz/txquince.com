import { describe, expect, it } from "vitest";
import { sanitizeAttribution, sourceName, summarizeAttribution } from "./attribution";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148";

describe("sanitizeAttribution", () => {
  it("keeps the sending page and visitor id, drops unknown keys", () => {
    const out = sanitizeAttribution({ source: "google.com", page: "/budget", vid: "abc123", evil: "x", src: "Instagram" });
    expect(out).toEqual({ source: "google.com", page: "/budget", vid: "abc123", src: "instagram" });
  });

  it("stamps the device from the User-Agent, never from the client", () => {
    expect(sanitizeAttribution({ page: "/", device: "desktop" }, IPHONE)).toEqual({ page: "/", device: "phone" });
  });

  it("returns null when nothing usable arrives", () => {
    expect(sanitizeAttribution(null)).toBeNull();
    expect(sanitizeAttribution({ foo: "bar" })).toBeNull();
  });
});

describe("sourceName", () => {
  it("names tags and common hosts", () => {
    expect(sourceName("gbp")).toBe("Google Business");
    expect(sourceName("google.com")).toBe("Google");
    expect(sourceName("l.instagram.com")).toBe("Instagram");
    expect(sourceName("direct")).toBe("Direct / typed in");
    expect(sourceName("theknot.com")).toBe("theknot.com");
  });
});

describe("summarizeAttribution", () => {
  it("prefers the ?src= tag and reports the sending page", () => {
    const s = summarizeAttribution({ source: "google.com", landing: "/irving", src: "instagram", page: "/budget", referrer: "https://www.google.com/" });
    expect(s).toMatchObject({ source: "Instagram", sentFrom: "/budget", firstLanded: "/irving", referrer: "google.com" });
  });

  it("is null for empty attribution", () => {
    expect(summarizeAttribution(null)).toBeNull();
    expect(summarizeAttribution({})).toBeNull();
  });
});
