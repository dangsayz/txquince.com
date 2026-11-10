import { describe, expect, it } from "vitest";
import { eventKey, eventsForClient, publicTags, tagValue, venueEvents, type VenueEventPhoto } from "./venue-events";

const V = "convention-plaza-ballroom";
let n = 0;
const photo = (over: Partial<VenueEventPhoto> = {}): VenueEventPhoto => {
  n += 1;
  return {
    id: `id-${n}`,
    url: `/api/img/p-${n}`,
    alt: "",
    section: "celebration",
    is_feature: false,
    sort_order: n,
    width: 800,
    height: 1200,
    slug: `${V}-ana-${100 + n}`,
    ...over,
  };
};

describe("eventKey", () => {
  it("groups by the shoot name in the slug, ignoring frame numbers", () => {
    expect(eventKey({ id: "a", slug: `${V}-ana-433` }, V)).toBe(eventKey({ id: "b", slug: `${V}-ana-12` }, V));
    expect(eventKey({ id: "a", slug: `${V}-ana-433` }, V)).not.toBe(eventKey({ id: "c", slug: `${V}-sofia-433` }, V));
  });
  it("lets an xv: tag override the slug", () => {
    expect(eventKey({ id: "a", slug: `${V}-ana-1`, tags: "xv: spring 2026" }, V)).toBe("tag:spring 2026");
  });
  it("reads tag values", () => {
    expect(tagValue("dress, theme: Blush & gold ,xv:a", "theme")).toBe("Blush & gold");
    expect(tagValue("dress", "theme")).toBeNull();
  });
});

describe("venueEvents", () => {
  it("splits two shoots into numbered events with name-free anchors", () => {
    const photos = [photo(), photo(), photo({ slug: `${V}-sofia-1` }), photo({ slug: `${V}-sofia-2` })];
    const events = venueEvents(photos, V);
    expect(events.map((e) => [e.number, e.anchor, e.photos.length])).toEqual([
      [1, "xv-01", 2],
      [2, "xv-02", 2],
    ]);
    expect(JSON.stringify(events.map((e) => [e.anchor, e.theme, e.moments]))).not.toMatch(/ana|sofia/);
  });

  it("orders photos and moments like the day", () => {
    const events = venueEvents([photo({ section: "celebration" }), photo({ section: "church" }), photo({ section: "portraits" })], V);
    expect(events[0].moments.map((m) => m.id)).toEqual(["misa", "portraits", "celebration"]);
    expect(events[0].photos[0].section).toBe("church");
  });

  it("names the theme from an owner tag, else from shared colors, else nothing", () => {
    expect(venueEvents([photo({ tags: "theme:Old Hollywood" })], V)[0].theme?.en).toBe("Old Hollywood");
    const pink = venueEvents([photo({ colors: ["rosa-palo", "dorado"] }), photo({ colors: ["rosa-palo", "dorado"] })], V)[0];
    expect(pink.theme).toEqual({ en: "Blush & Gold", es: "Rosa palo y dorado" });
    expect(venueEvents([photo()], V)[0].theme).toBeNull();
  });

  it("caps the preview at five varied photos and dedupes vendors", () => {
    const vendor = { name: "A", business: "Bloom Co", slug: "bloom", category: "florist", role: null };
    const photos = Array.from({ length: 12 }, (_, i) =>
      photo({ section: i < 2 ? "church" : i < 6 ? "portraits" : "celebration", vendors: i % 2 ? [vendor] : [] }),
    );
    const [e] = venueEvents(photos, V);
    expect(e.preview).toHaveLength(5);
    expect(new Set(e.preview).size).toBe(5);
    expect(e.vendors).toEqual([{ name: "Bloom Co", slug: "bloom", role: null, category: "florist" }]);
  });
});

describe("highlights", () => {
  it("names specific moments and skips catch-alls", () => {
    const [e] = venueEvents(
      [photo({ section: "el-vals" }), photo({ section: "grand-entrance" }), photo({ section: "celebration" }), photo({ section: "portraits" })],
      V,
    );
    expect(e.highlights.map((h) => h.id)).toEqual(["grand-entrance", "el-vals"]);
  });
});

describe("what leaves the server", () => {
  it("eventsForClient drops the storage path, tags and old slug from every photo", () => {
    const row = { ...photo({ tags: "xv:a, Pink Gown" }), storage_path: "portfolio/venues/ana-433.webp", old_slug: `${V}-ana-433` };
    const sent = JSON.stringify(eventsForClient(venueEvents([row, { ...row, id: "id-b" }], V)));
    expect(sent).not.toMatch(/storage_path|old_slug|ana-433|xv:a|tags/);
    expect(sent).toContain(row.url);
  });

  it("publicTags keeps only the tags written for visitors", () => {
    expect(publicTags("Pink Gown, xv:a, theme: blush, DFW")).toBe("Pink Gown, DFW");
    expect(publicTags("xv:a")).toBeNull();
    expect(publicTags(null)).toBeNull();
  });
});
