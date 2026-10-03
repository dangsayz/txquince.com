import assert from "node:assert/strict";
import test from "node:test";
import { imageTransformForWidth } from "../src/lib/image-derivative.ts";
import brandedImageLoader from "../src/lib/image-loader.ts";

function scaledDimensions(source, options) {
  const factor = Math.min(
    1,
    options.width / source.width,
    options.height === undefined ? Infinity : options.height / source.height,
  );
  return {
    width: Math.round(source.width * factor),
    height: Math.round(source.height * factor),
  };
}

test("portrait derivatives honor the requested srcset width", () => {
  assert.deepEqual(
    scaledDimensions({ width: 2000, height: 3000 }, imageTransformForWidth(1440)),
    { width: 1440, height: 2160 },
  );
});

test("derivatives preserve landscape aspect ratio and do not upscale", () => {
  assert.deepEqual(
    scaledDimensions({ width: 3000, height: 2000 }, imageTransformForWidth(1440)),
    { width: 1440, height: 960 },
  );
  assert.deepEqual(
    scaledDimensions({ width: 800, height: 1200 }, imageTransformForWidth(1440)),
    { width: 800, height: 1200 },
  );
});

test("the full-size viewer requests a wide derivative without losing its cache version", () => {
  assert.equal(
    brandedImageLoader({ src: "/api/img/portrait?v=3", width: 2400 }),
    "/api/img/portrait?v=3&w=2400",
  );
});
