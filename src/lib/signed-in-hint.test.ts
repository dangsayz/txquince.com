import { describe, expect, it } from "vitest";
import { signedInHint } from "./signed-in-hint";

describe("signedInHint", () => {
  it("signed out: no cookie, or zero", () => {
    expect(signedInHint("")).toBe(false);
    expect(signedInHint("a=1; __client_uat=0")).toBe(false);
    expect(signedInHint("__client_uat=0; __client_uat_AbC123=0")).toBe(false);
  });
  it("signed in: any non-zero cookie, whichever comes first", () => {
    expect(signedInHint("__client_uat=1762718400")).toBe(true);
    expect(signedInHint("__client_uat=0; __client_uat_AbC123=1762718400")).toBe(true);
    expect(signedInHint("x=y; __client_uat_AbC123=1762718400; __client_uat=0")).toBe(true);
  });
});
