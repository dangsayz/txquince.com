/**
 * home.ts — HOME PAGE COPY (the page does ~70% of the selling)
 * Direct, no fluff, confident. Show the work; don't talk about the work.
 */

export const home = {
  hero: {
    headline: "Her quinceañera, remembered exactly as it felt.",
    subline:
      "Cinematic quinceañera photography & film across Dallas–Fort Worth.",
  },

  // THE EXPERIENCE — reliability is the anti-flaky-vendor differentiator.
  experience: {
    eyebrow: "The experience",
    heading: "Two storytellers. One unrepeatable day.",
    points: [
      {
        title: "Two storytellers, one day",
        body: "Photo and film, working together — so nothing important happens off-camera.",
      },
      {
        title: "Your sneak peek within the week",
        body: "A first look at her day while the emotion is still fresh — not months later.",
      },
      {
        title: "On time, every time",
        body: "I answer every message and arrive when I said I would. On the one day you can't redo, reliability isn't a perk — it's the point.",
      },
    ],
  },

  work: {
    eyebrow: "The work",
    heading: "A day worth this much care, photographed like it.",
    cta: "See full galleries",
  },

  film: {
    eyebrow: "On film",
    heading: "Some moments only motion can hold.",
    body: "Her voice, the music, the room — a highlight film the whole family returns to.",
  },

  packages: {
    eyebrow: "Investment",
    heading: "Collections starting at $2,500.",
    body: "Fixed pricing, no surprises. Most families choose Signature.",
    cta: "See all collections",
  },

  testimonials: {
    eyebrow: "From other quince moms",
    heading: "The families who trusted me with the day.",
  },
} as const;
