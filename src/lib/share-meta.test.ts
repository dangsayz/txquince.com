import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ogBase } from "./share-meta";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe("share metadata", () => {
  it("ogBase restates the site name, locale and default share image", () => {
    expect(ogBase("es")).toMatchObject({ siteName: "TX Quince", locale: "es_US", type: "website" });
    expect(ogBase("en").images?.[0].url).toBe("/opengraph-image");
    expect(ogBase("en", { image: false })).not.toHaveProperty("images");
  });

  // A page-level openGraph object replaces the root layout's, share image
  // included. Every one must restate the image (ogBase or its own `images`).
  it("every page-level openGraph keeps a share image", () => {
    const missing = [...walk("src/app"), ...walk("src/components")]
      .filter((file) => !file.includes("_shell"))
      .filter((file) => {
        const source = readFileSync(file, "utf8");
        const block = source.match(/openGraph: \{[\s\S]*?\n\s*\},?\n|openGraph: \{.*\},?\n/);
        return block !== null && !/ogBase\(|images/.test(block[0]) && !/opengraph-image/.test(readdirSync(join(file, "..")).join(" "));
      });
    expect(missing).toEqual([]);
  });
});
