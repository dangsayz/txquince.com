import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRICE_BOOK,
  commissionSchema,
  hourSteps,
  maxHoursFor,
  momentsDateAllowed,
  normalizeHours,
  priceBookSchema,
  quoteCommission,
  type PriceBook,
} from "./commission";
import { matrixFor, tierBullets, tierDetail } from "@/components/txq/data";
import { detailsFor } from "@/components/budget/budget-details";
import { fillPkg, pkgField } from "./package-text";

const edit = (f: (b: PriceBook) => void): PriceBook => {
  const b = structuredClone(DEFAULT_PRICE_BOOK) as PriceBook;
  f(b);
  return priceBookSchema.parse(b) as PriceBook;
};
const cell = (b: PriceBook, label: string, tier: "moments" | "solo" | "cinema" | "trio") =>
  matrixFor(b).flatMap((g) => g.rows).find((r) => r.label.en === label)!.values[tier];

describe("half hours", () => {
  it("prices an added half hour at half the hourly rate", () => {
    const q = quoteCommission(DEFAULT_PRICE_BOOK, "moments", [], 2.5);
    expect(q.hours).toBe(2.5);
    expect(q.extraHoursUsd).toBe(125);
    expect(q.totalUsd).toBe(625);
  });

  it("snaps any request to the nearest half hour, inside the package's limits", () => {
    expect(normalizeHours(DEFAULT_PRICE_BOOK, "moments", 2.3)).toBe(2.5);
    expect(normalizeHours(DEFAULT_PRICE_BOOK, "moments", 9)).toBe(4);
    expect(hourSteps(DEFAULT_PRICE_BOOK, "moments")).toEqual([2, 2.5, 3, 3.5, 4]);
  });

  it("lets a package include 1.5 hours", () => {
    const b = edit((x) => (x.packages.moments.hours = 1.5));
    expect(quoteCommission(b, "moments", []).hours).toBe(1.5);
    expect(tierBullets(b, "moments")[0].en).toBe("1 photographer, from 1.5 hours");
  });

  it("refuses quarter hours from a request", () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const base = { event_date: d.toISOString().slice(0, 10), city: "dfw", scope: "both", tier: "moments", name: "Ana", email: "a@b.co", phone: "5555555", language: "en" };
    expect(commissionSchema.safeParse({ ...base, hours: 2.5 }).success).toBe(true);
    const r = commissionSchema.safeParse({ ...base, hours: 2.25 });
    expect(r.success).toBe(false);
    expect(r.error!.issues.some((i) => i.path[0] === "hours")).toBe(true);
  });
});

describe("per-package settings", () => {
  it("each package's most hours comes from the book", () => {
    expect(maxHoursFor(DEFAULT_PRICE_BOOK, "solo")).toBe(6);
    const b = edit((x) => (x.packages.solo.maxHours = 5.5));
    expect(maxHoursFor(b, "solo")).toBe(5.5);
    expect(quoteCommission(b, "solo", [], 8).hours).toBe(5.5);
  });

  it("the Saturday window comes from the book", () => {
    const today = "2027-03-01";
    expect(momentsDateAllowed(DEFAULT_PRICE_BOOK, "moments", "2027-04-03", today)).toBe(false); // 33 days
    const b = edit((x) => (x.momentsSaturdayDays = 45));
    expect(momentsDateAllowed(b, "moments", "2027-04-03", today)).toBe(true);
  });
});

describe("package wording", () => {
  it("one photo count changes the table, the card, the home line and the budget page", () => {
    const b = edit((x) => (x.content.moments.photos = "200–300"));
    expect(cell(b, "Edited photos", "moments")!.en).toBe("200–300, more for each added hour");
    expect(tierBullets(b, "moments").at(-1)!.en).toBe("200–300 edited photos for 2 hours");
    expect(tierDetail(b, "moments").en).toContain("200–300 photos");
    const d = detailsFor("moments", 2, [], "en", b);
    expect(d.included.find((l) => l.icon === "camera")!.text).toBe("200–300 edited photos, more for each added hour");
  });

  it("one camera count changes the Solo everywhere", () => {
    const b = edit((x) => (x.content.solo.cameras = "2"));
    expect(pkgField(b, "solo", "team")!.en).toBe("1 hybrid shooter (photo + video), 2 camera setup");
    expect(cell(b, "Full-length film", "solo")!.en).toContain("cut from the 2 camera angles");
    expect(tierBullets(b, "solo")[0].es).toBe("1 fotógrafo y videógrafo en uno, 2 cámaras");
  });

  it("an emptied field is left out everywhere", () => {
    const b = edit((x) => (x.content.trio.album = { en: "", es: "" }));
    expect(cell(b, "Printed photo album", "trio")).toBeNull();
    expect(detailsFor("trio", 7, [], "en", b).included.some((l) => l.icon === "album")).toBe(false);
  });

  it("the defaults say what the site said before", () => {
    const b = DEFAULT_PRICE_BOOK;
    expect(cell(b, "Your team", "solo")!.en).toBe("1 hybrid shooter (photo + video), 2–3 camera setup");
    expect(cell(b, "Edited photos", "trio")!.en).toBe("700+");
    expect(cell(b, "Dress or save-the-date session", "cinema")!.en).toBe("Included after your deposit · 30–40 photos");
    expect(cell(b, "Full-length film", "moments")!.en).toBe("Add a film of the presentation for $250");
    expect(cell(b, "Highlight video", "solo")!.en).toBe("Add a 3–5 min film for $500");
    expect(fillPkg("{team} · {session}", "cinema", b, "es")).toBe("1 fotógrafo + 1 videógrafo · 30–40");
  });
});
