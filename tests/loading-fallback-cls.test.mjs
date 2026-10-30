import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// The homepage renders inside app/(en)/loading.tsx's Suspense boundary, and
// React streams the large page behind it: the prerendered HTML paints the
// skeleton and the footer first, then swaps the page in. A skeleton shorter
// than the viewport put the footer mid-screen at first paint and it jumped
// away (homepage CLS 0.17-0.29 on phones). The skeleton must reserve a full
// viewport so the footer starts below the fold.

const requireReact = await import("react");
const requireReactJsxRuntime = await import("react/jsx-runtime");

function loadComponent(path) {
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
    require: (id) => {
      if (id === "react/jsx-runtime") return requireReactJsxRuntime;
      if (id === "react") return requireReact;
      if (id.endsWith(".css")) return {};
      throw new Error(`Unexpected import: ${id}`);
    },
  });
  return exports;
}

test("the route loading fallback carries the viewport-reserving class", () => {
  const { default: LoadingPage } = loadComponent("../src/app/(en)/loading.tsx");
  const root = LoadingPage();
  assert.equal(root.props.role, "status");
  assert.ok(root.props.className.split(/\s+/).includes("tq-pg-loading"), root.props.className);
});

test("the loading fallback reserves at least the full dynamic viewport", () => {
  const css = readFileSync(new URL("../src/components/txq/pages/pages.css", import.meta.url), "utf8");
  const rule = css.match(/\.txq \.tq-pg-loading\s*\{([^}]*)\}/);
  assert.ok(rule, "pages.css defines .txq .tq-pg-loading");
  assert.match(rule[1], /min-height:\s*100dvh\s*;/);
});
