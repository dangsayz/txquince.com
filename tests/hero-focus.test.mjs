import assert from "node:assert/strict";
import test from "node:test";
import { heroObjectPosition, resolveHeroFocus } from "../src/lib/hero-focus.ts";

test("uses the saved focal anchor for the homepage crop", () => {
  assert.deepEqual(resolveHeroFocus({ focusX: 0.54, focusY: 0.93 }), {
    focusX: 0.54,
    focusY: 0.93,
  });
  assert.equal(heroObjectPosition(resolveHeroFocus({ focusX: 0.54, focusY: 0.93 })), "54% 93%");
});

test("uses a lower portrait crop when no valid anchor is saved", () => {
  assert.deepEqual(resolveHeroFocus({}), { focusX: 0.5, focusY: 0.8 });
  assert.deepEqual(resolveHeroFocus({ focusX: -1, focusY: Number.NaN }), {
    focusX: 0.5,
    focusY: 0.8,
  });
});
