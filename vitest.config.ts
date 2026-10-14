import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest runs the TypeScript suites (*.test.ts). The older node:test suites
// (*.test.mjs) run under `npm run test:node`; `npm test` runs both.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Server modules import "server-only", which throws outside a React
      // server build. Tests call those modules directly, so stub the marker.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
  },
});
