/**
 * review-public.ts — what a public page may know about an approved review
 * (no invite slug, no private notes). Dependency-free so client components
 * (the homepage) can import it without pulling in zod.
 */
export type PublicReview = {
  id: string;
  rating: number;
  body: string;
  name: string;
  daughterName: string | null;
  city: string | null;
  /** "March 2026", from the event date the owner entered or the submission date. */
  when: string | null;
  photoCount: number;
  featured: boolean;
};

/** Photo n of an approved review, resized by /api/reviews/photo. */
export function reviewPhotoUrl(id: string, n: number, width = 1080): string {
  return `/api/reviews/photo/${id}/${n}?w=${width}`;
}
