import assert from "node:assert/strict";
import test from "node:test";
import { hasFullBleedResolution, selectFullBleedPhoto } from "../src/lib/quality-photo.ts";

test("full-width placements exclude small portrait uploads", () => {
  const photos = [
    { id: "small", width: 720, height: 1080 },
    { id: "ready", width: 2133, height: 3200 },
    { id: "wide", width: 3200, height: 2133 },
  ];
  assert.equal(hasFullBleedResolution(photos[0]), false);
  assert.equal(selectFullBleedPhoto(photos, 0)?.id, "ready");
  assert.equal(selectFullBleedPhoto(photos, 1)?.id, "wide");
});

test("missing metadata and empty portfolios never become full-width sources", () => {
  assert.equal(hasFullBleedResolution({ width: null, height: null }), false);
  assert.equal(selectFullBleedPhoto([{ width: null, height: null }]), null);
  assert.equal(selectFullBleedPhoto([]), null);
});
