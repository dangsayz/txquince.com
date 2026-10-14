// Node resolve hook for tests: maps "@/…" to src/ and lets extensionless
// relative imports find their .ts/.tsx file (what Next's bundler does).
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = new URL("../../src/", import.meta.url);

export async function resolve(specifier, context, next) {
  let spec = specifier;
  if (spec.startsWith("@/")) spec = new URL(spec.slice(2), SRC).href;
  const isPath = spec.startsWith("file:") || spec.startsWith("./") || spec.startsWith("../");
  if (isPath && !/\.[cm]?[jt]sx?$|\.json$/.test(spec)) {
    const base = spec.startsWith("file:") ? new URL(spec) : new URL(spec, context.parentURL);
    for (const ext of [".ts", ".tsx", "/index.ts"]) {
      const candidate = fileURLToPath(base) + ext;
      if (existsSync(candidate)) return next(pathToFileURL(candidate).href, context);
    }
  }
  return next(spec, context);
}
