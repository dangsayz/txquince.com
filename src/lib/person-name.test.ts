import { describe, expect, it } from "vitest";
import { cleanNameInput, isFullName } from "./person-name";

describe("isFullName", () => {
  it("accepts real names, accents and all", () => {
    for (const n of ["Maria Garcia", "Ana María de la O", "Mary-Jo O'Neil", "José Ángel Núñez", "Nguyễn Thị Lan"]) expect(isFullName(n)).toBe(true);
  });
  it("refuses junk, single names, digits and symbols", () => {
    for (const n of ["dfdfdf43r34r", "Maria", "x y", "Maria G", "Maria Garcia 2", "<b>Maria Garcia</b>", "Maria  ", "😀 Garcia", "a".repeat(90) + " b"]) expect(isFullName(n)).toBe(false);
  });
});
describe("cleanNameInput", () => {
  it("drops digits and symbols as she types, keeps name punctuation", () => {
    expect(cleanNameInput("dfdfdf43r34r")).toBe("dfdfdfrr");
    expect(cleanNameInput("  Mary-Jo   O'Neil 3rd!")).toBe("Mary-Jo O'Neil rd");
    expect(cleanNameInput("x".repeat(200))).toHaveLength(80);
  });
});
