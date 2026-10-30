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
  tagline: "Quinceañera photos & video across Dallas–Fort Worth",
  serviceArea: "Dallas–Fort Worth, Texas",

  contact: {
    // Public-facing contact address (shown in the footer, mailto links, and
    // schema). NOTE: transactional send-from is a separate identity — see
    // RESEND_FROM / FROM in src/lib/resend.ts — so this can be a Gmail address.
    email: "quincebookings@gmail.com",
    // Public phone. Families text far more than they email, so this number is
    // offered as Text / WhatsApp / Call wherever a family might reach out
    // (footer, menu, booking panel, city pages, blog posts, /links) and in the
    // LocalBusiness schema. Display form here; E.164 below for sms:/tel: links.
    phone: "(945) 200-1939",
    phoneE164: "+19452001939",
    // WhatsApp click-to-chat (wa.me takes the number without the "+"). The
    // prefilled first message follows the page's language.
    whatsapp: "https://wa.me/19452001939",
    whatsappMessage: {
      en: "Hi! I'd like to check my quinceañera date.",
      es: "¡Hola! Quiero consultar la fecha de mi quinceañera.",
    },
  },

  social: {
    instagram: "https://www.instagram.com/txquince/",
    facebook: "", // no public page yet (groups-only) — icon hidden until set
    youtube: "https://www.youtube.com/@txquince",
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
    // Trust signal DFW churches/venues screen for before they let a photographer
    // shoot. Operator confirmed coverage is in place — keep this honest.
    insuredLine: "Insured & venue-compliant",
  },

  nav: [
    { href: "/portfolio", label: "Portfolio" },
    { href: "/#commissions", label: "Packages" },
    { href: "/quinceanera-photographer", label: "Areas Served" },
    { href: "/quinceanera-guide", label: "Guide" },
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
    href: "/#intake",
  },
  secondaryCta: {
    label: "Questions first? Inquire",
    href: "/check-your-date",
  },
} as const;

export type Site = typeof site;
