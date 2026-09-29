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

test("prefers a written alt when only the title is a filename", () => {
  assert.equal(publicPhotoCopy({ title: "kimberly-quince-482.jpg", alt: "Kimberly opening birthday gifts" }, fallback).title, "Kimberly opening birthday gifts");
});
