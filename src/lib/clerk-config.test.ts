import { describe, expect, it, vi } from "vitest";
import { safeNext } from "./clerk-config";

vi.mock("server-only", () => ({}));
const { publicName } = await import("./clerk-user");

describe("safeNext", () => {
  it("keeps a path on this site", () => {
    expect(safeNext("/blog/a#comments")).toBe("/blog/a#comments");
  });
  it("refuses another site, protocol-relative and backslash tricks", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", ""]) {
      expect(safeNext(bad, "/")).toBe("/");
    }
  });
});

describe("publicName", () => {
  it("shows first name + last initial, never the email", () => {
    expect(publicName("Maria", "Gonzalez", null)).toBe("Maria G.");
    expect(publicName("Maria", null, null)).toBe("Maria");
    expect(publicName(null, null, "quincemom")).toBe("quincemom");
    expect(publicName(null, null, null)).toBe("Quince Network member");
  });
});
