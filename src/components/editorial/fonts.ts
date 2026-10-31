/**
 * Homepage-only type: Oswald (condensed uppercase display, with accents for
 * Spanish; one weight, 500, so the page preloads a single display file) and Instrument Serif italic
 * (the one serif accent). Body text stays Inter from the site shell.
 *
 * Loaded by the homepage routes only, so other pages never download them.
 * next/font self-hosts the files and adjusts the fallback metrics, so the
 * swap causes no layout shift.
 */
import { Instrument_Serif, Oswald } from "next/font/google";

export const display = Oswald({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-ed-display",
  display: "swap",
});

export const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-ed-serif",
  display: "swap",
  preload: false,
});

export const editorialFonts = `${display.variable} ${serif.variable}`;
