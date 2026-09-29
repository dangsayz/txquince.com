import assert from "node:assert/strict";
import test from "node:test";
import { publicPhotoCopy } from "../src/lib/public-photo-copy.ts";

const fallback = "Quinceañera celebration";

test("replaces filename metadata without treating a filename location as a city", () => {
  assert.deepEqual(
    publicPhotoCopy({
      title: "12img kimberly quince Kimberly Quince 482 jpg at irving",
      alt: "12img kimberly quince Kimberly Quince 482 jpg at irving",
      caption: "12img kimberly quince Kimberly Quince 482 jpg at irving",
      city: null,
    }, fallback),
    { title: fallback, alt: fallback, description: fallback },
  );
});

test("uses only structured city for a fallback", () => {
  assert.equal(
    publicPhotoCopy({ title: "DSC_0482.JPG", alt: "IMG 0482", city: "Irving" }, fallback).title,
    `${fallback} in Irving`,
  );
});

test("preserves genuinely written titles, alt text, and captions", () => {
  assert.deepEqual(
    publicPhotoCopy({
      title: "The moment she saw her family",
      alt: "Kimberly smiling as she opens gifts at her quinceañera",
      caption: "A joyful moment from Kimberly's celebration.",
      city: "Irving",
    }, fallback),
    {
      title: "The moment she saw her family",
      alt: "Kimberly smiling as she opens gifts at her quinceañera",
      description: "A joyful moment from Kimberly's celebration.",
    },
  );
});

test("keeps a descriptive alt without turning it into a visible title", () => {
  assert.deepEqual(
    publicPhotoCopy({ title: "kimberly-quince-482.jpg", alt: "Kimberly opening birthday gifts" }, fallback),
    { title: fallback, alt: "Kimberly opening birthday gifts", description: "Kimberly opening birthday gifts" },
  );
});

test("hides numbered import names and opaque IDs on public photo pages", () => {
  assert.deepEqual(
    publicPhotoCopy({
      title: "zapata quincea era 83",
      alt: "Quinceañera in a magenta gown seated on the grass",
    }, fallback),
    { title: fallback, alt: "Quinceañera in a magenta gown seated on the grass", description: "Quinceañera in a magenta gown seated on the grass" },
  );
  assert.deepEqual(
    publicPhotoCopy({
      title: "4950A5AB 3275 44DF A157 EA715CDE5A50",
      alt: "4950A5AB-3275-44DF-A157-EA715CDE5A50",
    }, fallback),
    { title: fallback, alt: fallback, description: fallback },
  );
});
