import assert from "node:assert/strict";
import test from "node:test";
import { selectGalleryItems } from "./gallery-model.ts";

const images = [
  { url: "/api/img/first", alt: "Golden portrait", title: "Zara", section: "portraits", slug: "first", city: "Dallas" },
  { url: "/api/img/second", alt: "Church ceremony", title: "Amelia", section: "church", slug: "second", city: "Fort Worth" },
  { url: "/api/img/third", alt: "Portrait at sunset", title: "Bella", section: "portraits", slug: "third", city: "Dallas" },
  { url: null, alt: "Unreleased placeholder", section: "portraits" },
];
const sections = [{ id: "portraits", title: "Portraits" }, { id: "church", title: "Church & Mass" }];
const base = { query: "", category: "all", sort: "curated", savedOnly: false, saved: [] };

test("search matches descriptive text and moment labels without showing placeholders", () => {
  assert.deepEqual(selectGalleryItems(images, sections, { ...base, query: "  CHURCH  " }).map((item) => item.slug), ["second"]);
  assert.deepEqual(selectGalleryItems(images, sections, { ...base, query: "dallas" }).map((item) => item.slug), ["first", "third"]);
});

test("category and title sort preserve the source list", () => {
  const sorted = selectGalleryItems(images, sections, { ...base, category: "portraits", sort: "title" });
  assert.deepEqual(sorted.map((item) => item.slug), ["third", "first"]);
  assert.deepEqual(images.map((item) => item.slug), ["first", "second", "third", undefined]);
});

test("saved collection only shows present released images with matching stable keys", () => {
  const selected = selectGalleryItems(images, sections, { ...base, savedOnly: true, saved: ["portraits/third", "church/deleted"] });
  assert.deepEqual(selected.map((item) => item.slug), ["third"]);
});
