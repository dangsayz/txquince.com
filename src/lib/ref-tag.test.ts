import { describe, expect, it } from "vitest";
import { normalizeRef, sourceKey } from "./ref-tag";
import { sanitizeAttribution } from "./attribution";

describe("ref tags", () => {
  it("keeps clean tags and lower-cases them", () => {
    for (const t of ["pinterest", "gbp", "youtube", "reddit", "quora", "mandalay", "blog", "fb-group-irving"]) {
      expect(normalizeRef(t)).toBe(t);
    }
    expect(normalizeRef(" Pinterest ")).toBe("pinterest");
  });

  it("drops anything that isn't a tag", () => {
    expect(normalizeRef("")).toBeNull();
    expect(normalizeRef("<script>")).toBeNull();
    expect(normalizeRef("a b")).toBeNull();
    expect(normalizeRef("x".repeat(41))).toBeNull();
    expect(normalizeRef(42)).toBeNull();
  });

  it("is saved with an inquiry's attribution, cleaned", () => {
    const a = sanitizeAttribution({ source: "google.com", landing: "/irving/mandalay-canal", ref: "Mandalay", refLanding: "/budget" });
    expect(a).toMatchObject({ source: "google.com", ref: "mandalay", refLanding: "/budget" });
    expect(sanitizeAttribution({ ref: "bad tag!" })).toBeNull();
  });

  it("groups the dashboard by the ref tag first, then the first-touch source", () => {
    expect(sourceKey({ source: "google.com", ref: "mandalay" })).toBe("mandalay");
    expect(sourceKey({ source: "Pinterest.com" })).toBe("pinterest.com");
    expect(sourceKey(null)).toBe("direct");
  });
});
