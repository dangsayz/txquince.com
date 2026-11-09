/**
 * Package facts are never typed into copy.
 *
 * The owner edits each package's name, crew, hours, highlight film and dress
 * session at /admin/packages; copy must read them through the tokens in
 * src/lib/price-text.ts (PT.name, PT.team, PT.hours, PT.highlight,
 * PT.sessionIn …) so one save changes every page. This scans the source of
 * every file that writes public copy and fails on a hand-typed fact.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = [
  "src/content",
  "src/components/txq/copy.ts",
  "src/lib/inquiry.ts",
  "src/components/PhotoshootPage.tsx",
  "src/components/VideographerPage.tsx",
  "src/components/budget",
  "src/app/quinceanera-guide/page.tsx",
  "src/app/quinceanera-photographer",
  "src/app/es/fotografo-de-quinceaneras",
  "src/app/budget/page.tsx",
  "src/app/es/presupuesto/page.tsx",
];
/** The package wording itself (the owner's defaults) and tests are allowed. */
const SKIP = [/\.test\./, /package-content\.ts$/, /content\/packages\.ts$/];

const FACTS: { what: string; re: RegExp }[] = [
  { what: "a package name (use PT.name / PT.nameEs)", re: /\b(The Duo|The Trio|El Dúo|El Trío|The Solo|El Solo|Just the Moments|Los Momentos)\b/ },
  { what: "a crew (use PT.team / PT.teamEs)", re: /\b(one|1|two|2) photographers? (\+|and) (one|1) videographers?\b/i },
  { what: "a crew (use PT.teamEs)", re: /\b(1|2|dos) fotógrafos? (\+|y) (1|un) videógrafos?\b|\b(un|1) fotógrafo \+ (un|1) videógrafo/i },
  { what: "a highlight length (use PT.highlight)", re: /\b1[- ]minute highlight|resumen de 1 minuto/i },
  { what: "which packages include the session (use PT.sessionIn)", re: /Duo and (the )?Trio (both )?include|Dúo y (el )?Trío incluyen/i },
  { what: "included hours (use PT.hours)", re: /\bfor 2 hours\b|\(2\+ hours\)|\bfrom 2 hours\b|desde 2 horas|\(2\+ horas\)/ },
];

function files(path: string): string[] {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((f) => files(join(path, f)));
}

/** Source lines that can reach a page: comments are dropped. */
function copyLines(file: string): { n: number; text: string }[] {
  return readFileSync(file, "utf8")
    .split("\n")
    .map((text, i) => ({ n: i + 1, text }))
    .filter(({ text }) => !/^\s*(\/\/|\*|\/\*)/.test(text))
    .map(({ n, text }) => ({ n, text: text.replace(/\/\/.*$/, "") }));
}

describe("package facts come from the live book", () => {
  const all = ROOTS.flatMap(files).filter((f) => /\.(ts|tsx)$/.test(f) && !SKIP.some((s) => s.test(f)));

  it("scans the copy files", () => {
    expect(all.length).toBeGreaterThan(30);
  });

  it("no copy types a package name, crew, highlight length, session rule or hours", () => {
    const hits: string[] = [];
    for (const f of all) {
      for (const { n, text } of copyLines(f)) {
        for (const fact of FACTS) {
          const m = text.match(fact.re);
          if (m) hits.push(`${f}:${n} typed ${fact.what}: “${m[0]}”`);
        }
      }
    }
    expect(hits).toEqual([]);
  });
});
