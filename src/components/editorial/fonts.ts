/**
 * Homepage-only type: PT Serif, the one serif accent (roman numerals and small
 * uppercase index lines). Jost (display) and Inter (body) come from the site
 * shell, because the header and footer use them on every page.
 *
 * next/font self-hosts the file and adjusts the fallback metrics, so the swap
 * causes no layout shift. Not preloaded: it is only used below the fold.
 */
import { PT_Serif } from "next/font/google";

export const serif = PT_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ed-serif",
  display: "swap",
  preload: false,
});

export const editorialFonts = serif.variable;
