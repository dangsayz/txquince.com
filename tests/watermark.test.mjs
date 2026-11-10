import assert from "node:assert/strict";
import test from "node:test";
import { markPlan, scaledSize, slugTakesMark, markStream, MARK_MIN_WIDTH } from "../src/lib/watermark.ts";
import { capSrcSet } from "../src/lib/image-slot-shared.ts";

test("small files carry no mark", () => {
  assert.equal(markPlan(MARK_MIN_WIDTH - 1, 900), null);
  assert.equal(markPlan(512), null);
  assert.ok(markPlan(MARK_MIN_WIDTH, 960));
});

test("a 2:3 portrait gets 2.5% type and letters 4% from the edge", () => {
  const p = markPlan(1440, 2160);
  // type = 36px → PNG (550px at 60px type) scales to 330px; inset = 57.6 - 21.6 = 36.
  assert.deepEqual(p, { width: 330, inset: 36 });
});

test("a landscape of the same area gets the same mark, not a bigger one", () => {
  assert.deepEqual(markPlan(2160, 1440), markPlan(1440, 2160));
});

test("the mark always fits inside the photo", () => {
  for (const [w, h] of [[640, 427], [640, 960], [1080, 1620], [2400, 1600], [2400, 3600], [1440, null]]) {
    const p = markPlan(w, h);
    assert.ok(p.width + p.inset < w * 0.4, `${w}x${h}: ${JSON.stringify(p)}`);
  }
});

test("page banners stay clean, content photos are signed", () => {
  assert.equal(slugTakesMark("hero"), false);
  assert.equal(slugTakesMark("cover-about"), false);
  assert.equal(slugTakesMark("album-hamptons-twins-dress-session-002"), true);
  assert.equal(slugTakesMark("pink-gown-portrait"), true);
});

test("the output size follows scale-down (never larger than the original)", () => {
  assert.deepEqual(scaledSize(1440, 2000, 3000), { w: 1440, h: 2160 });
  assert.deepEqual(scaledSize(2400, 1600, 2400), { w: 1600, h: 2400 });
  assert.deepEqual(scaledSize(1080, null, null), { w: 1080, h: null });
});

test("the mark file is a PNG", async () => {
  const { value } = await markStream().getReader().read();
  assert.deepEqual([...value.slice(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test("a capped srcset drops the files that are too wide", () => {
  const set = "/a-480.webp 480w, /a-960.webp 960w, /a-1600.webp 1600w, /a-2400.webp 2400w";
  assert.equal(capSrcSet(set, 1600), "/a-480.webp 480w, /a-960.webp 960w, /a-1600.webp 1600w");
  assert.equal(capSrcSet(set, undefined), set);
  assert.equal(capSrcSet("/a-2400.webp 2400w", 1600), "/a-2400.webp 2400w");
});
