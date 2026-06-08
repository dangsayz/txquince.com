/**
 * testimonials.ts — SOCIAL PROOF (LAW 5: CONSENT)
 *
 * ONLY publish quotes/photos from families who have signed a parental model
 * release AND whose contract grants marketing usage rights. Every subject is a
 * minor — no exceptions, no scraping, no inventing quotes.
 *
 * The entries below are CLEARLY-LABELED PLACEHOLDERS (`released: false`) so the
 * page has structure now. Replace them with real, release-cleared testimonials
 * and set `released: true` before launch. Components hide any entry that is not
 * released, so nothing un-cleared can ever render.
 */

export type Testimonial = {
  quote: string;
  /** Mother's name (the buyer). */
  momName: string;
  /** Daughter's first name (the quinceañera). */
  daughterName: string;
  location?: string;
  /** R2 key for a release-cleared photo, or "" for a typographic card. */
  photoKey: string;
  photoAlt?: string;
  /** Must be true for the testimonial to render. Default false = never shown. */
  released: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "[PLACEHOLDER — replace with a real, release-cleared quote.] He showed up early, calmed my nerves, and gave us photographs I will hand down to my grandchildren.",
    momName: "Mamá (placeholder)",
    daughterName: "Quinceañera",
    location: "Fort Worth, TX",
    photoKey: "",
    photoAlt: "",
    released: false,
  },
  {
    quote:
      "[PLACEHOLDER — replace with a real, release-cleared quote.] We had our sneak peek the same week. My daughter cried. Worth every dollar.",
    momName: "Mamá (placeholder)",
    daughterName: "Quinceañera",
    location: "Dallas, TX",
    photoKey: "",
    photoAlt: "",
    released: false,
  },
  {
    quote:
      "[PLACEHOLDER — replace with a real, release-cleared quote.] After two vendors flaked on us, he was the one who answered every message and showed up exactly when he said he would.",
    momName: "Mamá (placeholder)",
    daughterName: "Quinceañera",
    location: "Arlington, TX",
    photoKey: "",
    photoAlt: "",
    released: false,
  },
];

/** Only testimonials with a signed release ever reach the UI. */
export const releasedTestimonials = (): Testimonial[] =>
  testimonials.filter((t) => t.released);
