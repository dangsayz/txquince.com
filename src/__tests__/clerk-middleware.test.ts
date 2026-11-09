/**
 * Clerk middleware options. Passing `secretKey` as an option makes Clerk
 * demand CLERK_ENCRYPTION_KEY, and every Clerk route 500s in production
 * (it did on 2026-11-09). Clerk must read CLERK_SECRET_KEY from env instead.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(join(__dirname, "../middleware.ts"), "utf8");

describe("clerkMiddleware options", () => {
  it("never passes secretKey (needs CLERK_ENCRYPTION_KEY)", () => {
    expect(src).not.toMatch(/secretKey\s*:/);
  });
});
