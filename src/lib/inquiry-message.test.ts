import { describe, expect, it } from "vitest";
import { callScript, parsePickedRequest, scriptBookends, scriptLangFor, startTimeCheck } from "./inquiry-message";

const MESSAGE = [
  "Sent from the package picker. Nothing was booked or charged.",
  "Package: The Trio — $2,800 (7 hrs included)",
  "Hours on the day: 7",
  "+ Day-of Coordinator (per day) — $500",
  "Team (included, 3): 2 photographers + 1 videographer",
  "Total: $3,300 · Deposit (25%): $825 · Balance: $2,475",
  "City: Houston · Venue: test · Starts: 4:47 PM",
  "Scope: both",
  "Quinceañera: goya",
  "Preferred language: English",
  "",
  "Note from family:",
  "church at 1 then event at 6 - 10pm",
  "OK to share some photos publicly: yes",
].join("\n");

describe("parsePickedRequest", () => {
  it("reads every line of a package-picker request", () => {
    expect(parsePickedRequest(MESSAGE)).toEqual({
      intro: "Sent from the package picker. Nothing was booked or charged.",
      isOffer: false,
      packageName: "The Trio",
      packagePrice: "$2,800",
      includedHours: "7",
      hours: "7",
      extras: [{ name: "Day-of Coordinator (per day)", price: "$500" }],
      team: "2 photographers + 1 videographer",
      coordinatorIncluded: false,
      total: "$3,300",
      deposit: "$825",
      depositPercent: "25",
      balance: "$2,475",
      signedBy: null,
      city: "Houston",
      venue: "test",
      startTime: "4:47 PM",
      honoree: "goya",
      language: "English",
      note: "church at 1 then event at 6 - 10pm",
      sharePhotos: true,
    });
  });

  it("keeps a note of several lines, extra hours and an offer", () => {
    const r = parsePickedRequest(
      [
        "OFFER from the budget page: $2,000 for this coverage (our price: $2,650). Reply to accept, counter or decline. Nothing was booked or charged.",
        "Package: The Duo — $2,200 (5 hrs included)",
        "+ 1.5 extra hr(s) — $450",
        "Hours on the day: 6.5",
        "Team (included, 2): 1 photographer + 1 videographer",
        "Day-of coordinator: included",
        "Total: $2,650 · Deposit (25%): $663 · Balance: $1,987",
        "City: Dallas",
        "Scope: both",
        "Preferred language: Español",
        "",
        "Note from family:",
        "Mass first.",
        "",
        "Then the hall.",
        "OK to share some photos publicly: no",
      ].join("\n"),
    )!;
    expect(r.isOffer).toBe(true);
    expect(r.extras).toEqual([{ name: "1.5 extra hr(s)", price: "$450" }]);
    expect(r.coordinatorIncluded).toBe(true);
    expect(r.venue).toBeNull();
    expect(r.note).toBe("Mass first.\n\nThen the hall.");
    expect(r.sharePhotos).toBe(false);
  });

  it("leaves a message a person typed alone", () => {
    expect(parsePickedRequest("Hi! Do you have June 12 open? Package: not sure yet")).toBeNull();
    expect(parsePickedRequest("")).toBeNull();
    expect(parsePickedRequest(null)).toBeNull();
  });
});

describe("callScript", () => {
  it("says the request back in call order, with only its own facts", () => {
    const steps = callScript(parsePickedRequest(MESSAGE)!, "Saturday, January 23, 2027");
    expect(steps.map((s) => s.topic)).toEqual(["The day", "Start time", "The package", "Extras", "The price", "Your note", "Photos"]);
    expect(steps.map((s) => s.say)).toEqual([
      "goya's quinceañera is on Saturday, January 23, 2027, in Houston, at test.",
      "We start at 4:47 PM.",
      "You picked The Trio, with 2 photographers and 1 videographer, for 7 hours.",
      "You added Day-of Coordinator (per day) for $500.",
      "The total is $3,300. The deposit is $825, that is 25%. The balance is $2,475.",
      "You told us: “church at 1 then event at 6 - 10pm”",
      "You are okay with us sharing some photos publicly.",
    ]);
  });

  it("skips what the request does not say", () => {
    const steps = callScript(parsePickedRequest("Package: Portrait Session — $450 (1 hrs included)\nHours on the day: 1")!, null);
    expect(steps).toEqual([{ topic: "The package", say: "You picked Portrait Session, for 1 hour." }]);
  });
});

describe("startTimeCheck", () => {
  const withNote = (startTime: string | null, note: string | null) => ({ ...parsePickedRequest(MESSAGE)!, startTime, note });

  it("flags a start time the note does not mention", () => {
    expect(startTimeCheck(withNote("4:47 PM", "church at 1 then event at 6 - 10pm"))).toBe(
      "The start time says 4:47 PM, but their note mentions 1 PM, 6 PM and 10 PM. Ask which time we start.",
    );
  });

  it("stays quiet when they agree, or the note names no time", () => {
    expect(startTimeCheck(withNote("4:30 PM", "Mass at 4:30 then the party"))).toBeNull();
    expect(startTimeCheck(withNote("1:00 PM", "church at 1 then event at 6"))).toBeNull();
    expect(startTimeCheck(withNote("6:00 PM", "We love pink. 3 kids in the court, 14 chambelanes."))).toBeNull();
    expect(startTimeCheck(withNote(null, "church at 1"))).toBeNull();
    expect(startTimeCheck(withNote("4:47 PM", null))).toBeNull();
  });

  it("reads Spanish notes and says it in Spanish", () => {
    expect(startTimeCheck(withNote("4:47 PM", "misa a la 1 y fiesta de 6 a 10pm"))).toBe(
      "The start time says 4:47 PM, but their note mentions 1 PM, 6 PM and 10 PM. Ask which time we start.",
    );
    expect(startTimeCheck(withNote("6:00 PM", "de 3 damas y 14 chambelanes"))).toBeNull();
    expect(startTimeCheck(withNote("2:00 PM", "misa a las 3 y fiesta a las 7"), "es")).toBe(
      "La hora de inicio dice 2:00 PM, pero su nota menciona 3 PM y 7 PM. Pregunte a qué hora empezamos.",
    );
  });
});

describe("Spanish call script", () => {
  it("says the same facts in Spanish, keeping package names as the site shows them", () => {
    const r = { ...parsePickedRequest(MESSAGE)!, language: "Español" };
    expect(scriptLangFor(r)).toBe("es");
    expect(callScript(r, "sábado, 23 de enero de 2027", "es").map((s) => s.say)).toEqual([
      "Los quince de goya son el sábado, 23 de enero de 2027, en Houston, en test.",
      "Empezamos a las 4:47 PM.",
      "Eligió The Trio, con 2 fotógrafos y 1 videógrafo, por 7 horas.",
      "Agregó Day-of Coordinator (per day) por $500.",
      "El total es $3,300. El depósito es $825, o sea el 25%. El resto es $2,475.",
      "Nos dijo: “church at 1 then event at 6 - 10pm”",
      "Está de acuerdo con que compartamos algunas fotos en público.",
    ]);
    expect(scriptBookends("es", "Ana")).toEqual({ open: "Entonces Ana, déjeme confirmar que tengo todo bien.", close: "¿Tengo todo bien?" });
    expect(scriptLangFor(parsePickedRequest(MESSAGE)!)).toBe("en");
  });
});
