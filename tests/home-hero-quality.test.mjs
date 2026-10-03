import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { hasFullBleedResolution } from "../src/lib/quality-photo.ts";

function loadComponent(path, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  runInNewContext(compiled, {
    exports,
    require: (id) => dependencies[id] ?? requireModule(id),
  });
  return exports;
}

function requireModule(id) {
  if (id === "react/jsx-runtime") return requireReactJsxRuntime;
  if (id === "react") return requireReact;
  throw new Error(`Unexpected import: ${id}`);
}

const requireReact = await import("react");
const requireReactJsxRuntime = await import("react/jsx-runtime");

const staticPhotos = [
  { url: "/portfolio/hero.webp", alt: "Full-size portrait", section: "portraits", slug: "hero" },
  { url: "/portfolio/red-garden.webp", alt: "Small garden portrait", section: "portraits", slug: "garden" },
  { url: "/portfolio/lilac-arch.webp", alt: "Small arch portrait", section: "portraits", slug: "arch" },
];
const lowPhoto = { id: "low", url: "/api/img/low", alt: "Low resolution portrait", section: "portraits", slug: "low", width: 720, height: 1080 };
const highPhoto = { id: "high", url: "/api/img/high", alt: "High resolution portrait", section: "portraits", slug: "high", width: 2400, height: 1600, focus_x: 0.7, focus_y: 0.3 };

function findElement(node, type) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) return node.map((child) => findElement(child, type)).find(Boolean) ?? null;
  if (node.type === type) return node;
  return findElement(node.props?.children, type);
}

function homeWith(featured, heroMedia) {
  function HeroCarousel() {}
  const { EditorialHome } = loadComponent("../src/components/home/EditorialHome.tsx", {
    "next/image": () => null,
    "next/link": () => null,
    "@/components/EditMode": { EditOverlay: () => null },
    "@/components/VideoGallery": { VideoGallery: () => null },
    "@/content/about": { about: { approach: { body: "Studio story" } } },
    "@/content/home": { home: { faq: { items: [{}, { a: "Spanish answer" }, { a: "Travel answer" }] } } },
    "@/content/packages": { packages: [] },
    "@/content/portfolio-fallback": { portfolioFallback: staticPhotos },
    "@/content/portfolio-taxonomy": { altPhraseFor: () => "", categoryLabel: () => "Portraits", groupForCategory: () => "portraits" },
    "@/content/testimonials": { releasedTestimonials: () => [] },
    "@/lib/content-db": { getFeaturedImages: async () => featured, getVideos: async () => [], getHeroMedia: async () => heroMedia },
    "@/lib/hero-focus": { heroObjectPosition: (hero) => `${Math.round(hero.focusX * 100)}% ${Math.round(hero.focusY * 100)}%` },
    "@/lib/public-photo-copy": { publicPhotoCopy: (photo) => ({ alt: photo.alt }) },
    "@/lib/quality-photo": { hasFullBleedResolution },
    "@/components/home/HeroCarousel": { HeroCarousel },
    "./pixieset-home.css": {},
  });
  return EditorialHome({ locale: "en" }).then((tree) => findElement(tree, HeroCarousel).props.slides);
}

test("preserves the selected hero and adds only full-size featured photos", async () => {
  const slides = await homeWith([lowPhoto, highPhoto], {
    kind: "image", imageUrl: "/api/img/hero", imageAlt: "Selected portrait", focusX: 0.64, focusY: 0.77,
  });
  assert.deepEqual(Array.from(slides, (slide) => slide.url), ["/api/img/hero", "/api/img/high"]);
  assert.equal(slides[0].position, "64% 77%");
  assert.equal(slides[1].position, "70% 30%");
});

test("uses the strongest static fallback alone when featured photos are too small", async () => {
  const slides = await homeWith([lowPhoto], null);
  assert.deepEqual(Array.from(slides, (slide) => slide.url), ["/portfolio/hero.webp"]);
});

test("uses a full-size featured photo first when no hero is selected", async () => {
  const slides = await homeWith([lowPhoto, highPhoto], null);
  assert.deepEqual(Array.from(slides, (slide) => slide.url), ["/api/img/high"]);
});

test("does not offer carousel navigation for a single photograph", () => {
  const { HeroCarousel } = loadComponent("../src/components/home/HeroCarousel.tsx", {
    "next/image": { getImageProps: ({ src, alt }) => ({ props: { src, alt, style: {} } }) },
  });
  const photo = { url: "/portfolio/hero.webp", alt: "Portrait", position: "50% 50%" };
  const single = renderToStaticMarkup(createElement(HeroCarousel, { slides: [photo], locale: "en" }));
  const multiple = renderToStaticMarkup(createElement(HeroCarousel, { slides: [photo, { ...photo, url: "/api/img/second" }], locale: "en" }));
  assert.doesNotMatch(single, /Previous photograph|Next photograph|aria-roledescription="carousel"/);
  assert.match(multiple, /Previous photograph/);
  assert.match(multiple, /Next photograph/);
});
