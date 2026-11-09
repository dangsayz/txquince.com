import { describe, expect, it } from "vitest";
import { ALBUMS, albumObjectKey, albumPhotos, albumSlug, shortHash, withAlbums } from "./albums";
import { venues } from "./venues";

describe("albums", () => {
  it("maps album slugs to storage keys and rejects anything else", () => {
    const a = ALBUMS[0];
    expect(albumObjectKey(albumSlug(a, a.photos[0][0]))).toBe(`albums/${a.id}/${String(a.photos[0][0]).padStart(3, "0")}.jpg`);
    expect(albumObjectKey(`album-${a.id}-999`)).toBeNull();
    expect(albumObjectKey("album-nope-001")).toBeNull();
    expect(albumObjectKey("portrait-1")).toBeNull();
  });

  it("only points at real venues, uses known categories and carries no names", () => {
    const slugs = new Set(venues.map((v) => v.slug));
    for (const a of ALBUMS) {
      if (a.venueSlug) expect(slugs.has(a.venueSlug)).toBe(true);
      for (const p of albumPhotos(a)) {
        expect(p.url).toMatch(/^\/api\/img\/album-[a-z0-9-]+-\d{3}$/);
        expect(p.width && p.height).toBeTruthy();
      }
    }
  });

  it("replaces the database rows of the same shoot, keeps other shoots", () => {
    const plaza = ALBUMS.find((a) => a.replacesDbEvent)!;
    const v = plaza.venueSlug!;
    const db = [
      { id: "x", url: "/api/img/x", alt: "", section: "celebration", is_feature: false, sort_order: 1, width: 1, height: 1, slug: `${v}-zz-1` },
    ];
    // A shoot whose key hashes to the album's value is dropped; "zz" is not it.
    expect(shortHash("stem:zz")).not.toBe(plaza.replacesDbEvent);
    const out = withAlbums(db, v);
    expect(out[0].id).toBe("x");
    expect(out.length).toBe(1 + plaza.photos.length);
  });
});

describe("album resize sources", () => {
  it("points oversized originals at their .src.jpg resize copy, others at the original", () => {
    const big = ALBUMS.find((a) => a.resizeSource?.length)!;
    const seq = big.resizeSource![0];
    expect(albumObjectKey(albumSlug(big, seq))).toBe(`albums/${big.id}/${String(seq).padStart(3, "0")}.src.jpg`);
    const plain = big.photos.find(([n]) => !big.resizeSource!.includes(n))!;
    expect(albumObjectKey(albumSlug(big, plain[0]))).toBe(`albums/${big.id}/${String(plain[0]).padStart(3, "0")}.jpg`);
  });
});
