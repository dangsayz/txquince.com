import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { CONTACT_COPY, CONTACT_EVENT, CONTACT_KINDS, contactHref, smsHref, telHref, whatsappHref } from "./contact";

describe("contact links", () => {
  it("publishes the studio phone", () => {
    expect(site.contact.phone).toBe("(945) 200-1939");
    expect(site.contact.phoneE164).toBe("+19452001939");
  });

  it("builds sms / tel links from the E.164 number", () => {
    expect(smsHref()).toBe("sms:+19452001939");
    expect(telHref()).toBe("tel:+19452001939");
  });

  it("prefills the WhatsApp message in the page's language", () => {
    const en = new URL(whatsappHref("en"));
    const es = new URL(whatsappHref("es"));
    expect(`${en.origin}${en.pathname}`).toBe("https://wa.me/19452001939");
    expect(en.searchParams.get("text")).toBe("Hi! I'd like to check my quinceañera date.");
    expect(es.searchParams.get("text")).toBe("¡Hola! Quiero consultar la fecha de mi quinceañera.");
  });

  it("offers text first, then WhatsApp, then call — each with an event", () => {
    expect(CONTACT_KINDS).toEqual(["text", "whatsapp", "call"]);
    expect(CONTACT_EVENT).toEqual({ text: "contact_text", whatsapp: "contact_whatsapp", call: "contact_call" });
    expect(contactHref("text", "es")).toBe("sms:+19452001939");
    expect(contactHref("call", "en")).toBe("tel:+19452001939");
    expect(contactHref("whatsapp", "es")).toBe(whatsappHref("es"));
  });

  it("speaks the number to screen readers in both languages", () => {
    for (const lang of ["en", "es"] as const) {
      const c = CONTACT_COPY[lang];
      for (const label of [c.textAria, c.whatsappAria, c.callAria]) expect(label).toContain(site.contact.phone);
    }
    expect(CONTACT_COPY.es.text).toBe("Envíanos un texto");
    expect(CONTACT_COPY.es.call).toBe("Llámanos");
  });
});
