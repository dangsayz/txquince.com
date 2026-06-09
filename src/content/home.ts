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

  // AVAILABILITY — the homepage micro-commitment (live date check).
  checkDate: {
    heading: "Is her date still open?",
    body: "One celebration per day, no exceptions. Check your date — if it's open, you can hold it in two minutes.",
  },

  packages: {
    eyebrow: "Investment",
    heading: "Collections starting at $2,500.",
    body: "Fixed pricing, no surprises — reserve with a $500 deposit and split the rest into interest-free payments. Most families choose Signature.",
    cta: "See all collections",
  },

  // GOOD TO KNOW — the four objections that stall a quince mom before she inquires.
  faq: {
    eyebrow: "Good to know",
    heading: "The questions every quince family asks first.",
    items: [
      {
        q: "Do you offer payment plans?",
        a: "Yes. A $500 deposit reserves your date, and the balance splits into interest-free installments before the day — pay in full or in payments, your choice at checkout.",
      },
      {
        q: "¿Hablan español?",
        a: "Sí — consultas, planeación y todo el día del evento, en español o inglés. Su familia nunca necesitará traducir nada.",
      },
      {
        q: "Do you charge travel fees?",
        a: "Not anywhere in Dallas–Fort Worth. Church and venue across town from each other? Same coverage, same price.",
      },
      {
        q: "How far in advance should we book?",
        a: "Most families reserve 9–14 months out. I take one celebration per day, so popular Saturdays go first — if your date is open, the deposit is what holds it.",
      },
    ],
  },

  testimonials: {
    eyebrow: "From other quince moms",
    heading: "The families who trusted me with the day.",
  },
} as const;
