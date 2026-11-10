/**
 * budget-photos.ts — one published album photo per package, so every answer on
 * the budget page shows real work. Slugs come from src/content/albums (pick
 * with `node scripts/find-photo.cjs`). Alt text says what the photo shows and
 * never names a girl or a family.
 */
import type { EventTier } from "@/lib/budget-options";

export type BudgetPhoto = { slug: string; w: number; h: number; alt: { en: string; es: string } };

export const BUDGET_PHOTOS: Record<EventTier, BudgetPhoto> = {
  moments: {
    slug: "album-plaza-pink-gold-110",
    w: 2400,
    h: 1600,
    alt: {
      en: "A quinceañera in a pink gown waltzes on the dance floor between two fountains of sparks",
      es: "Una quinceañera con vestido rosa baila el vals en la pista entre dos fuentes de chispas",
    },
  },
  solo: {
    slug: "album-plaza-pink-gold-054",
    w: 2400,
    h: 1600,
    alt: {
      en: "A quinceañera with a bouquet and a long train walks past her seated guests",
      es: "Una quinceañera con su ramo y una cola larga camina frente a sus invitados",
    },
  },
  cinema: {
    slug: "album-dreamhaus-pink-tiara-140",
    w: 3000,
    h: 2250,
    alt: {
      en: "A quinceañera sits with her rose gown spread across the floor of a gilded room",
      es: "Una quinceañera sentada con su vestido rosa extendido en el piso de un salón dorado",
    },
  },
  trio: {
    slug: "album-plaza-pink-gold-041",
    w: 2400,
    h: 1600,
    alt: {
      en: "The full court, damas in white and chambelanes in cowboy hats, lined up beside the quinceañera",
      es: "La corte completa, damas de blanco y chambelanes con sombrero, junto a la quinceañera",
    },
  },
};

/** A capped rendition from the site's image route. */
export const budgetPhotoSrc = (slug: string, w: number) => `/api/img/${slug}?w=${w}`;
