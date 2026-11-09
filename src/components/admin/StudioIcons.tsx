/** Studio icons: authored SVG, one 1.5px stroke, currentColor. Decorative unless labelled by the parent. */
import type { ReactNode } from "react";

export function ArrowIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`st-arrow ${className}`}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
    </svg>
  );
}

/**
 * Website sub-nav icons: soft, rounded, 18px on a 20 grid, same 1.5 stroke.
 * Each one is drawn for TX Quince's own pages, not a generic icon set.
 */
export type WebsiteIconName = "overview" | "photos" | "portfolio" | "films" | "imagery" | "images" | "prices" | "packages" | "guide" | "venues" | "reviews";

const WEBSITE_ICON_PATHS: Record<WebsiteIconName, ReactNode> = {
  // a small house: the hub of the site
  overview: <path d="M3.5 9.2 10 4l6.5 5.2V15a1.5 1.5 0 0 1-1.5 1.5h-2.5v-4h-5v4H5A1.5 1.5 0 0 1 3.5 15z" />,
  // a loose stack of prints
  photos: <><rect x="6" y="6.5" width="10.5" height="9" rx="2" /><path d="M13.5 6.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v6.5A1.5 1.5 0 0 0 5 13h1" /></>,
  // a framed portrait: head and shoulders
  portfolio: <><rect x="3.5" y="3.5" width="13" height="13" rx="2.5" /><circle cx="10" cy="8.6" r="2" /><path d="M6.3 16.5c.6-2.1 2-3.3 3.7-3.3s3.1 1.2 3.7 3.3" /></>,
  // a soft play button in a frame
  films: <><rect x="3" y="4.5" width="14" height="11" rx="3" /><path d="M8.6 7.9v4.2l3.5-2.1z" /></>,
  // a browser window holding an image
  imagery: <><rect x="3" y="4" width="14" height="12" rx="2.5" /><path d="M3 7.5h14M6.5 13.5l2.3-2.6 1.7 1.7 1.6-1.6 1.9 2.5" /></>,
  // a contact sheet
  images: <><rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1.5" /><rect x="11" y="3.5" width="5.5" height="5.5" rx="1.5" /><rect x="3.5" y="11" width="5.5" height="5.5" rx="1.5" /><rect x="11" y="11" width="5.5" height="5.5" rx="1.5" /></>,
  // a price tag
  prices: <><path d="M10.6 3.5H15a1.5 1.5 0 0 1 1.5 1.5v4.4a1.5 1.5 0 0 1-.44 1.06l-5.6 5.6a1.5 1.5 0 0 1-2.12 0l-4.4-4.4a1.5 1.5 0 0 1 0-2.12l5.6-5.6a1.5 1.5 0 0 1 1.06-.44z" /><circle cx="13" cy="7" r="1" /></>,
  // a gift box with a ribbon
  packages: <><rect x="3.5" y="7.5" width="13" height="9" rx="2" /><path d="M10 7.5v9M3.5 11h13M10 7.5C8.8 5 6.2 4.6 6.2 6.2c0 1 1.6 1.3 3.8 1.3zM10 7.5c1.2-2.5 3.8-2.9 3.8-1.3 0 1-1.6 1.3-3.8 1.3z" /></>,
  // market range bars
  guide: <><path d="M4 16.5h12" /><rect x="5" y="9.5" width="2.5" height="5" rx="1.25" /><rect x="8.75" y="5.5" width="2.5" height="9" rx="1.25" /><rect x="12.5" y="8" width="2.5" height="6.5" rx="1.25" /></>,
  // a map pin
  venues: <><path d="M10 17s-5-4.6-5-8.6a5 5 0 0 1 10 0c0 4-5 8.6-5 8.6z" /><circle cx="10" cy="8.4" r="1.8" /></>,
  // a speech bubble: what families said
  reviews: <path d="M4 4.5h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-3.5 3v-3H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />,
};

export function WebsiteIcon({ name, size = 18 }: { name: WebsiteIconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="st-subnav-icon">
      {WEBSITE_ICON_PATHS[name]}
    </svg>
  );
}
