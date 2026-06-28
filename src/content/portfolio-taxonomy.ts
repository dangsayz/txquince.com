/**
 * portfolio-taxonomy.ts — THE SINGLE SOURCE OF TRUTH for portfolio organization.
 *
 * Two layers:
 *   1. CATEGORIES  — ~37 granular "folders" you photo-dump into after a shoot.
 *   2. GROUPS      — the 7 public tabs visitors actually see; each category
 *                    rolls up into exactly one group.
 *
 * Every other file (admin uploader, public tabs, API validation, photo pages,
 * sitemap) imports from here. Add a category in ONE place and it appears
 * everywhere — the upload dropdown, the public tabs, validation, and SEO.
 *
 * BACKWARD COMPATIBILITY: the five original section ids
 *   save-the-date · church · portraits · celebration · films
 * are preserved exactly, so every photo already in the database keeps working.
 *
 * VENDOR_CATEGORIES is the separate, smaller list used for the reusable vendor
 * directory (a florist, an HMUA…). A photo can sit in a category AND credit one
 * or more vendors from the directory — the two are independent.
 */

export type GroupId =
  | "before"
  | "misa"
  | "portraits"
  | "celebration"
  | "details"
  | "vendors"
  | "films";

export type PortfolioGroup = {
  id: GroupId;
  /** Public tab label (kept short — these sit in a horizontal tab bar). */
  label: string;
  /** Small overline above the section heading. */
  eyebrow: string;
  /** Section H2 / tab heading. */
  title: string;
  /** One punchy line under the heading (the "hook"). */
  hook: string;
  /** A sentence of context (the "description"). */
  intro: string;
  /** SEO keyword phrase for this group (meta). */
  meta: string;
};

export type CategoryKind = "moment" | "vendor";

export type PortfolioCategory = {
  /** Stable slug — stored on each image as `section`. NEVER rename an existing one. */
  id: string;
  /** Admin + public label. */
  label: string;
  group: GroupId;
  kind: CategoryKind;
  /** Fallback alt-text phrase when a real description is missing. */
  altPhrase: string;
};

/* ---------------------------------------------------------------------------
 * GROUPS — the public tabs. Order here is the order of the tab bar.
 * ------------------------------------------------------------------------- */

export const GROUPS: PortfolioGroup[] = [
  {
    id: "before",
    label: "Before the Day",
    eyebrow: "Before the day",
    title: "Before the Day",
    hook: "The quiet hours before the world arrives.",
    intro:
      "The save-the-date session, getting ready, the first look — the calm, unrepeatable moments before the celebration begins.",
    meta: "quinceañera getting ready and save the date photography Dallas Fort Worth",
  },
  {
    id: "misa",
    label: "La Misa",
    eyebrow: "La misa",
    title: "Church & Mass",
    hook: "The sacred center of the day.",
    intro:
      "The mass — the rosary, the medalla y ramo, the blessing — photographed with reverence and a quiet, unobtrusive presence.",
    meta: "quinceañera church mass la misa photographer Dallas Fort Worth",
  },
  {
    id: "portraits",
    label: "Portraits",
    eyebrow: "Her, exactly as she is",
    title: "Portraits",
    hook: "Portraits she'll still love at thirty.",
    intro:
      "Solo portraits, family, and the court — candid, modern, and timeless.",
    meta: "quinceañera portrait photographer Dallas Fort Worth",
  },
  {
    id: "celebration",
    label: "The Celebration",
    eyebrow: "El vals & beyond",
    title: "The Celebration",
    hook: "The joy of the room, kept exactly as it felt.",
    intro:
      "La entrada, el vals, the ceremonies, the cake, the toast, and dancing until the night winds down.",
    meta: "quinceañera reception el vals celebration photographer Dallas Fort Worth",
  },
  {
    id: "details",
    label: "Details & Décor",
    eyebrow: "The little things",
    title: "Details & Décor",
    hook: "The details she spent a year choosing.",
    intro:
      "The dress, the shoes, the crown, the bouquet — and the room dressed for the night.",
    meta: "quinceañera dress details décor photography Dallas Fort Worth",
  },
  {
    id: "vendors",
    label: "Vendors",
    eyebrow: "The team behind the day",
    title: "The Vendors",
    hook: "The team that made the day happen.",
    intro:
      "The venues, florists, glam artists, bakers, and DJs we love working with across Dallas–Fort Worth.",
    meta: "quinceañera vendors venue florist HMUA Dallas Fort Worth",
  },
  {
    id: "films",
    label: "Films",
    eyebrow: "Motion",
    title: "Films",
    hook: "Her voice, the music, the room.",
    intro:
      "The day in motion — a film the family watches for years.",
    meta: "quinceañera videographer films Dallas Fort Worth",
  },
];

export const GROUP_IDS: GroupId[] = GROUPS.map((g) => g.id);

const GROUP_BY_ID: Record<string, PortfolioGroup> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g]),
);

export function groupById(id: string): PortfolioGroup | undefined {
  return GROUP_BY_ID[id];
}

/* ---------------------------------------------------------------------------
 * CATEGORIES — the granular dump folders. Order within a group = display order.
 * (Legacy ids are marked; do not rename them.)
 * ------------------------------------------------------------------------- */

export const CATEGORIES: PortfolioCategory[] = [
  // ── Before the Day ──────────────────────────────────────────────
  { id: "save-the-date", label: "Save-the-Date", group: "before", kind: "moment", altPhrase: "Quinceañera save-the-date portrait" }, // legacy
  { id: "getting-ready", label: "Getting Ready", group: "before", kind: "moment", altPhrase: "Quinceañera getting ready, hair and makeup" },
  { id: "first-look", label: "First Look", group: "before", kind: "moment", altPhrase: "Quinceañera first look with family" },

  // ── La Misa ─────────────────────────────────────────────────────
  { id: "church", label: "Church Ceremony", group: "misa", kind: "moment", altPhrase: "Quinceañera church mass, la misa" }, // legacy

  // ── Portraits ───────────────────────────────────────────────────
  { id: "portraits", label: "Solo Portraits", group: "portraits", kind: "moment", altPhrase: "Quinceañera portrait" }, // legacy
  { id: "family-portraits", label: "Family & Group", group: "portraits", kind: "moment", altPhrase: "Quinceañera family portrait" },
  { id: "the-court", label: "The Court", group: "portraits", kind: "moment", altPhrase: "Quinceañera court, damas and chambelanes" },
  { id: "with-escort", label: "With Her Escort", group: "portraits", kind: "moment", altPhrase: "Quinceañera with her chambelán de honor" },

  // ── The Celebration ─────────────────────────────────────────────
  { id: "grand-entrance", label: "Grand Entrance", group: "celebration", kind: "moment", altPhrase: "Quinceañera grand entrance, la entrada" },
  { id: "el-vals", label: "El Vals", group: "celebration", kind: "moment", altPhrase: "Quinceañera waltz, el vals" },
  { id: "father-daughter", label: "Father–Daughter Dance", group: "celebration", kind: "moment", altPhrase: "Father and daughter dance at a quinceañera" },
  { id: "surprise-dance", label: "Surprise Dance", group: "celebration", kind: "moment", altPhrase: "Quinceañera surprise dance, baile sorpresa" },
  { id: "changing-of-shoes", label: "Changing of the Shoes", group: "celebration", kind: "moment", altPhrase: "Quinceañera changing of the shoes ceremony" },
  { id: "crowning", label: "Crowning", group: "celebration", kind: "moment", altPhrase: "Quinceañera crowning, coronación" },
  { id: "last-doll", label: "Last Doll", group: "celebration", kind: "moment", altPhrase: "Quinceañera last doll, última muñeca" },
  { id: "toast", label: "Toast / Brindis", group: "celebration", kind: "moment", altPhrase: "Quinceañera toast, el brindis" },
  { id: "cake", label: "The Cake", group: "celebration", kind: "moment", altPhrase: "Quinceañera cake" },
  { id: "dinner", label: "Dinner", group: "celebration", kind: "moment", altPhrase: "Quinceañera reception dinner" },
  { id: "celebration", label: "The Party", group: "celebration", kind: "moment", altPhrase: "Quinceañera celebration and dancing" }, // legacy
  { id: "photo-booth", label: "Photo Booth", group: "celebration", kind: "moment", altPhrase: "Quinceañera photo booth candids" },
  { id: "send-off", label: "The Send-Off", group: "celebration", kind: "moment", altPhrase: "Quinceañera send-off at the end of the night" },

  // ── Details & Décor ─────────────────────────────────────────────
  { id: "the-details", label: "Dress & Details", group: "details", kind: "moment", altPhrase: "Quinceañera dress, shoes, and crown details" },
  { id: "venue-decor", label: "Venue & Décor", group: "details", kind: "moment", altPhrase: "Quinceañera reception venue and décor" },

  // ── Vendors (dump folders for vendor work; credit a vendor via tagging) ──
  { id: "vendor-venue", label: "Venue", group: "vendors", kind: "vendor", altPhrase: "Quinceañera venue" },
  { id: "vendor-hmua", label: "Hair & Makeup", group: "vendors", kind: "vendor", altPhrase: "Quinceañera hair and makeup" },
  { id: "vendor-dress", label: "Dress & Boutique", group: "vendors", kind: "vendor", altPhrase: "Quinceañera dress and boutique" },
  { id: "vendor-florist", label: "Florist", group: "vendors", kind: "vendor", altPhrase: "Quinceañera florals" },
  { id: "vendor-bakery", label: "Cake / Bakery", group: "vendors", kind: "vendor", altPhrase: "Quinceañera cake by the bakery" },
  { id: "vendor-dj", label: "DJ / Entertainment", group: "vendors", kind: "vendor", altPhrase: "Quinceañera DJ and entertainment" },
  { id: "vendor-decor", label: "Décor & Design", group: "vendors", kind: "vendor", altPhrase: "Quinceañera décor and event design" },
  { id: "vendor-catering", label: "Catering", group: "vendors", kind: "vendor", altPhrase: "Quinceañera catering" },
  { id: "vendor-choreographer", label: "Choreographer", group: "vendors", kind: "vendor", altPhrase: "Quinceañera choreographer" },
  { id: "vendor-stationery", label: "Invitations", group: "vendors", kind: "vendor", altPhrase: "Quinceañera invitations and stationery" },
  { id: "vendor-transport", label: "Transportation", group: "vendors", kind: "vendor", altPhrase: "Quinceañera transportation" },
  { id: "vendor-planner", label: "Planner", group: "vendors", kind: "vendor", altPhrase: "Quinceañera planner and coordinator" },

  // ── Films ───────────────────────────────────────────────────────
  { id: "films", label: "Films", group: "films", kind: "moment", altPhrase: "Quinceañera film still" }, // legacy
];

export const CATEGORY_IDS: string[] = CATEGORIES.map((c) => c.id);

const CATEGORY_BY_ID: Record<string, PortfolioCategory> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export function categoryById(id: string): PortfolioCategory | undefined {
  return CATEGORY_BY_ID[id];
}

export function categoryLabel(id: string): string {
  return CATEGORY_BY_ID[id]?.label ?? id;
}

export function altPhraseFor(id: string): string {
  return CATEGORY_BY_ID[id]?.altPhrase ?? "Quinceañera photo";
}

/** Group a category belongs to (defaults to "celebration" for unknown ids). */
export function groupForCategory(id: string): GroupId {
  return CATEGORY_BY_ID[id]?.group ?? "celebration";
}

/** Categories in a given group, in declaration order. */
export function categoriesInGroup(group: GroupId): PortfolioCategory[] {
  return CATEGORIES.filter((c) => c.group === group);
}

/** Categories grouped, for the admin upload <optgroup> dropdown. */
export const CATEGORIES_BY_GROUP: { group: PortfolioGroup; categories: PortfolioCategory[] }[] =
  GROUPS.map((g) => ({ group: g, categories: categoriesInGroup(g.id) }));

/* ---------------------------------------------------------------------------
 * VENDOR DIRECTORY — the reusable list of vendor types. Used for the vendor
 * record's `category` field and to label a credit on a photo ("Florals · @…").
 * ------------------------------------------------------------------------- */

export type VendorCategory = {
  /** Stored on the vendor record. */
  id: string;
  /** Admin dropdown label. */
  label: string;
  /** How the credit reads on a public photo ("Florals", "HMUA"…). */
  credit: string;
};

export const VENDOR_CATEGORIES: VendorCategory[] = [
  { id: "venue", label: "Venue", credit: "Venue" },
  { id: "hmua", label: "Hair & Makeup", credit: "HMUA" },
  { id: "dress", label: "Dress & Boutique", credit: "Dress" },
  { id: "florist", label: "Florist", credit: "Florals" },
  { id: "bakery", label: "Cake / Bakery", credit: "Cake" },
  { id: "dj", label: "DJ / Entertainment", credit: "DJ" },
  { id: "decor", label: "Décor & Design", credit: "Décor" },
  { id: "catering", label: "Catering", credit: "Catering" },
  { id: "choreographer", label: "Choreographer", credit: "Choreography" },
  { id: "stationery", label: "Invitations", credit: "Invitations" },
  { id: "transport", label: "Transportation", credit: "Transportation" },
  { id: "planner", label: "Planner", credit: "Planning" },
  { id: "photographer", label: "Photographer", credit: "Photography" },
  { id: "videographer", label: "Videographer", credit: "Film" },
  { id: "other", label: "Other", credit: "Vendor" },
];

export const VENDOR_CATEGORY_IDS: string[] = VENDOR_CATEGORIES.map((v) => v.id);

const VENDOR_CATEGORY_BY_ID: Record<string, VendorCategory> = Object.fromEntries(
  VENDOR_CATEGORIES.map((v) => [v.id, v]),
);

export function vendorCategoryLabel(id: string | null | undefined): string {
  return (id && VENDOR_CATEGORY_BY_ID[id]?.label) || "Vendor";
}

/** The credit label for a vendor ("Florals", "HMUA"…) from its category. */
export function vendorCreditLabel(id: string | null | undefined): string {
  return (id && VENDOR_CATEGORY_BY_ID[id]?.credit) || "Vendor";
}
