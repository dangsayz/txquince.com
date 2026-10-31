/**
 * Homepage-only type: Oswald (condensed uppercase display, one variable file
 * covering every weight, with accents for Spanish) and Instrument Serif italic
 * (the one serif accent). Body text stays Inter from the site shell.
 *
 * Loaded by the homepage routes only, so other pages never download them.
 * next/font self-hosts the files and adjusts the fallback metrics, so the
 * swap causes no layout shift.
 */
import { Instrument_Serif, Oswald } from "next/font/google";

export const display = Oswald({
  subsets: ["latin"],
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
