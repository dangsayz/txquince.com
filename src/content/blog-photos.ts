/**
 * blog-photos.ts — release-cleared photos that ship with the site itself
 * (public/blog/photos/*.webp), for blog `image` blocks.
 *
 * Most blog images live in the portfolio database and resolve by slug through
 * getBlogImages. These are owner-supplied story photos (no faces, no names)
 * that were resized and compressed for the web and nothing else: no crops,
 * filters, overlays or AI edits. A blog `image` block whose slug is listed here
 * resolves from this registry before the database is asked.
 *
 * Rules for adding one: never put a girl's name in the file name, alt text or
 * caption; record the real pixel size so the frame reserves its space (no
 * layout shift).
 */
export type BlogPhoto = {
  /** Path under public/. */
  src: string;
  width: number;
  height: number;
  alt: string;
};

const dir = "/blog/photos";

export const BLOG_PHOTOS: Record<string, BlogPhoto> = {
  // Red-gown dress session (story-01 to story-04).
  "quinceanera-red-ball-gown-back-view-courtyard-dfw": {
    src: `${dir}/quinceanera-red-ball-gown-back-view-courtyard-dfw.webp`,
    width: 1600,
    height: 2133,
    alt: "Quinceañera in a red ball gown seen from behind, a big satin bow and long train spread across the paving of an arched stone courtyard during a Dallas–Fort Worth dress session",
  },
  "quinceanera-red-gown-train-stone-steps-dfw": {
    src: `${dir}/quinceanera-red-gown-train-stone-steps-dfw.webp`,
    width: 1600,
    height: 2400,
    alt: "Back view of a quinceañera's red sparkle tulle gown with its train fanned out over stone steps between two dark wood doors, a tiara on her long braid, DFW dress session",
  },
  "quinceanera-gold-tiara-curls-back-view-dfw": {
    src: `${dir}/quinceanera-gold-tiara-curls-back-view-dfw.webp`,
    width: 1600,
    height: 2400,
    alt: "Gold quinceañera tiara on a half-up hairstyle with long dark curls, photographed from behind against soft garden greenery and a stone building in Dallas–Fort Worth",
  },
  "quinceanera-tiara-corset-back-detail-dfw": {
    src: `${dir}/quinceanera-tiara-corset-back-detail-dfw.webp`,
    width: 1600,
    height: 2400,
    alt: "Detail of a quinceañera's gold tiara, long curls and beaded red corset back, one hand on her waist, outdoors at a Spanish-style building during a DFW dress session",
  },

  // Pink-gown reception (story-05 to story-10).
  "quinceanera-pink-gown-beading-detail-dfw": {
    src: `${dir}/quinceanera-pink-gown-beading-detail-dfw.webp`,
    width: 1600,
    height: 2400,
    alt: "Close-up of a pink quinceañera gown covered in rose-gold sequins, rhinestones and embroidered vines, hands resting on the skirt, at a Dallas–Fort Worth reception",
  },
  "mis-quince-neon-sign-white-rose-wall-dfw": {
    src: `${dir}/mis-quince-neon-sign-white-rose-wall-dfw.webp`,
    width: 1600,
    height: 2400,
    alt: "White “Mis Quince” neon sign with a small gold crown glowing on a wall of white roses at a quinceañera reception in Dallas–Fort Worth",
  },
  "quinceanera-gold-throne-crystal-centerpiece-dfw": {
    src: `${dir}/quinceanera-gold-throne-crystal-centerpiece-dfw.webp`,
    width: 1600,
    height: 2400,
    alt: "Gold-and-cream quinceañera throne in front of a white rose wall and blush drapes, with a gold crystal-ball centerpiece and pink and white roses on the table, DFW reception",
  },
  "quinceanera-head-table-pink-napkins-gold-chargers-dfw": {
    src: `${dir}/quinceanera-head-table-pink-napkins-gold-chargers-dfw.webp`,
    width: 1600,
    height: 2400,
    alt: "Quinceañera head table set with folded pink napkins on gold chargers over a blush tablecloth, a greenery and white rose runner behind, at a Dallas–Fort Worth reception",
  },
  "quinceanera-pink-15-cake-crown-roses-dfw": {
    src: `${dir}/quinceanera-pink-15-cake-crown-roses-dfw.webp`,
    width: 1600,
    height: 2133,
    alt: "Four-tier pink quinceañera cake with a gold “15”, a rhinestone crown on top and a cascade of pink and white roses, on a gold sequin table at a DFW reception",
  },
  "quinceanera-last-doll-teddy-bear-pink-gown-dfw": {
    src: `${dir}/quinceanera-last-doll-teddy-bear-pink-gown-dfw.webp`,
    width: 1600,
    height: 2400,
    alt: "Quinceañera last doll: a white teddy bear in a pink gown with rose-gold embroidery and a small crown, between jeweled keepsake pillows on a rose-gold table, DFW reception",
  },
};

export function getBlogPhoto(slug: string): BlogPhoto | undefined {
  return BLOG_PHOTOS[slug];
}
