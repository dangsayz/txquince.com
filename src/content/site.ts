/**
 * site.ts — GLOBAL SITE CONFIG (operator edits this file directly)
 *
 * This is the single source of truth for brand, contact, social links, and the
 * SCARCITY values that drive the sticky bar, hero microline, and final CTA band.
 * Update `scarcity.bookedThrough` as you book out — every scarcity surface reads
 * from here, so you change it in ONE place.
 *
 * Content-as-code (LAW 3 / LAW 4): no CMS, no lock-out. You own this.
 */

export const site = {
  brand: "TX Quince",
  // Used for canonical URLs, OG images, sitemap, schema. No trailing slash.
  url: "https://txquince.com",
  domain: "txquince.com",
  tagline: "Cinematic quinceañera photography & film across Dallas–Fort Worth",
  serviceArea: "Dallas–Fort Worth, Texas",

  contact: {
    // The operator's owned channels (LAW 4). Email is the reply-from identity too.
    email: "quincebookings@gmail.com",
    // Optional public phone — leave "" to hide it. Booking is a phone relationship,
    // but inquiries flow through the form first to stay qualified.
    phone: "",
    // E.164 for tel: links if/when phone is shown.
    phoneE164: "",
  },

  social: {
    instagram: "https://www.instagram.com/txquince/",
    facebook: "", // no public page yet (groups-only) — icon hidden until set
  },

  /**
   * SCARCITY (LAW): operator is fully booked. These values frame the whole site
   * as reserving limited remaining dates + next-year booking + a cancellation
   * waitlist. NEVER promise a date is open — the form promises a personal reply.
   */
  scarcity: {
    bookedThrough: "September 2026", // [MONTH] — edit as you book
    reservingYear: "2027", // [YEAR] — the year you're now reserving
    // Sticky top bar copy is composed from the two values above.
    barText: "Booked through September 2026 · Now reserving limited 2027 dates",
    // Short line used under the hero headline.
    heroMicroline: "Booked through September 2026 — a few 2027 dates remain.",
    // Final CTA band headline.
    finalBand: "Only a few 2027 dates remain. Let's make sure yours is one of them.",
  },

  // Aggregate social proof (keep honest — see LAW 5 on testimonials/consent).
  proof: {
    familiesServed: "100+",
    familiesLine: "Trusted by 100+ DFW families",
    rating: "5.0",
    stars: 5,
  },

  nav: [
    { href: "/portfolio", label: "Portfolio" },
    { href: "/investment", label: "Investment" },
    { href: "/blog", label: "Guide" },
    { href: "/about", label: "About" },
  ],

  /**
   * SELF-SERVE BOOKING (deposit) config — operator-editable single source.
   * The deposit reserves the date; the balance is settled later. Change the
   * amount here and every surface (form, emails, success page) updates.
   */
  booking: {
    depositCents: 50_000, // $500 — flat deposit to reserve any date
    depositLabel: "$500",
    currency: "usd",
    holdMinutes: 30, // how long the date is held during Stripe checkout
    policyNote:
      "Your deposit reserves your date and is applied to your final balance. Fully refundable if I ever have to cancel.",
  },

  /**
   * PRIMARY CTA, site-wide (CONVERSION MECHANICS LAW): ready-to-commit families
   * reserve their date with a deposit. The SECONDARY CTA is the soft path for
   * the still-deciding — questions first, no payment.
   */
  cta: {
    label: "Reserve Your Date",
    href: "/reserve",
  },
  secondaryCta: {
    label: "Questions first? Inquire",
    href: "/check-your-date",
  },
} as const;

export type Site = typeof site;
