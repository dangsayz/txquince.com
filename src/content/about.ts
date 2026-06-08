/**
 * about.ts — ABOUT PAGE COPY (the trust engine)
 *
 * Weaves the differentiator: families get let down by unreliable vendors, so
 * reliability, communication, and protecting the once-in-a-lifetime day are the
 * whole point. Cultural fluency (la misa, el vals, la corte, el saludo, los
 * padrinos) + bilingual. Voice: direct, warm, confident, no fluff.
 *
 * Replace [OPERATOR NAME] and the portrait key with the real, release-cleared
 * photo of the operator before launch.
 */

export const about = {
  operatorName: "[OPERATOR NAME]", // TODO: replace with real name
  portraitKey: "" as string, // R2 key for a warm, real photo of the operator
  portraitAlt:
    "Portrait of the photographer behind TX Quince in Dallas–Fort Worth.",

  eyebrow: "About",
  heading: "I built this around the families other vendors let down.",

  // Lead paragraph(s) — the story.
  story: [
    "I started photographing quinceañeras because I kept hearing the same thing from families in Dallas–Fort Worth: the photographer stopped answering. The videographer never sent the film. Someone disappeared two weeks before the most important day of their daughter's life.",
    "That isn't a small thing. A quinceañera happens once. You can't reschedule the way she felt in her dress, or the look on her father's face during el vals. If the person you trusted doesn't show up, the day still happens — it just goes unremembered.",
    "So I built everything around the opposite of that. I answer every message. I confirm and re-confirm. I arrive early. I take a limited number of celebrations each season so every family gets my full attention — and so I'm never stretched too thin to do the day justice.",
  ],

  // Cultural fluency block.
  culture: {
    heading: "I know the day — every part of it.",
    body: "La misa, el vals, la corte de honor, el saludo, los padrinos — these aren't moments I have to be told about. I know when to step close and when to disappear, and I work in English and Spanish so nothing gets lost between us.",
  },

  // Approach.
  approach: {
    heading: "Candid, modern, timeless.",
    body: "I photograph the day as it actually feels — not stiff poses, not trends that will look dated in five years. Real emotion, made beautiful, made to last.",
  },

  closing:
    "If you're planning your daughter's quinceañera and you want someone who will simply be there — reach out. Let's see if your date is open.",
} as const;
