import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // tests/*.test.mjs are node:test suites (run with `node --test`), not vitest.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
