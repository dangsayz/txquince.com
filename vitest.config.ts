import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside a React Server bundle; handler tests import
      // server modules directly, so it resolves to an empty module here.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // tests/*.test.mjs are node:test suites (run with `node --test`), not vitest.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
