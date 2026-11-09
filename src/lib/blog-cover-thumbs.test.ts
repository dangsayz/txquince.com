import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/content-db", () => ({ getBlogImages: vi.fn(), getFeaturedImages: vi.fn(), getPageHero: vi.fn() }));
vi.mock("@/lib/image-slot-store", () => ({ getSlotVersion: vi.fn() }));

import { dedupeThumbs } from "./blog-cover";

const t = (url: string) => ({ url, alt: url });

describe("dedupeThumbs", () => {
  it("keeps each post's own photo when all differ", () => {
    const out = dedupeThumbs([["a", t("1")], ["b", t("2")]], [t("9")]);
    expect(out.get("a")?.url).toBe("1");
    expect(out.get("b")?.url).toBe("2");
  });

  it("gives a repeated photo the next unused spare", () => {
    const out = dedupeThumbs([["a", t("1")], ["b", t("1")], ["c", t("1")]], [t("1"), t("8"), t("9")]);
    expect([...out.values()].map((v) => v?.url)).toEqual(["1", "8", "9"]);
  });

  it("keeps the repeat when no spare is left, and passes null through", () => {
    const out = dedupeThumbs([["a", t("1")], ["b", t("1")], ["c", null]], [t("1")]);
    expect(out.get("b")?.url).toBe("1");
    expect(out.get("c")).toBeNull();
  });
});
