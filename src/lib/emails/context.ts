/** What every family email knows about its booking. */
import type { Lang } from "./layout";

export type FamilyCtx = {
  lang: Lang;
  name: string;
  /** YYYY-MM-DD */
  eventDate: string;
  ref: string;
  /** The family's private page, in their language. */
  link: string;
};

export type OwnerCtx = {
  name: string;
  email: string;
  eventDate: string;
  ref: string;
  adminUrl: string;
};
