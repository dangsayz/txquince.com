import { Anton } from "next/font/google";

/**
 * Condensed display face for the homepage hero. Call sites are the homepage
 * page files (/ and /es), which pass `condensed.variable` down to <Hero>: a
 * font used from a page file is preloaded on that route only, so no other page
 * pays for it. (Used from the client hero directly, the build folds it into
 * the shell's shared stylesheet and preloads it everywhere.)
 * Anton ships a single, ultra-heavy weight; render it at 400 — asking for 700
 * would make the browser fake-bold an already black face.
 */
export const condensed = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-txq-condensed",
  display: "swap",
});
