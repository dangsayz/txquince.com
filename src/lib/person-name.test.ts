import { describe, expect, it } from "vitest";
import { cleanNameInput, isFullName, tidyName } from "./person-name";

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

describe("tidyName", () => {
  it("capitalizes names typed in one case and leaves mixed case alone", () => {
    expect(tidyName("vida")).toBe("Vida");
    expect(tidyName("  maria   garcia ")).toBe("Maria Garcia");
    expect(tidyName("MARIA DE LA O")).toBe("Maria de la O");
    expect(tidyName("mary-jo o'neil")).toBe("Mary-Jo O'Neil");
    expect(tidyName("McKenna DeShawn")).toBe("McKenna DeShawn");
    expect(tidyName("")).toBe("");
  });
});
