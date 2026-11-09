/**
 * Find a quoted passage inside the article and mark it, without touching the
 * DOM: ranges + the CSS Custom Highlight API (::highlight). Browsers without
 * it simply show no marks; quotes still read fine above each comment.
 */
export const PROSE_SELECTOR = ".tq-blog-prose";

type Pos = { node: Text; offset: number };

/** The article's text as one whitespace-collapsed string, with a map back to the DOM. */
function flatten(root: Element): { text: string; map: Pos[] } {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let text = "";
  const map: Pos[] = [];
  let lastSpace = true;
  let lastBlock: Element | null = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text;
    const parent = node.parentElement;
    if (!parent || parent.closest("script,style,[aria-hidden='true']")) continue;
    const data = node.data;
    // A new paragraph / list item reads as a space (a selection across two
    // blocks has a line break there).
    const block = parent.closest("p,li,h2,h3,h4,blockquote,figcaption,summary,dt,dd");
    if (block !== lastBlock && !lastSpace && data.length) {
      text += " ";
      map.push({ node, offset: 0 });
      lastSpace = true;
    }
    lastBlock = block;
    for (let i = 0; i < data.length; i++) {
      const space = /\s/.test(data[i]!);
      if (space && lastSpace) continue;
      text += space ? " " : data[i]!;
      map.push({ node, offset: i });
      lastSpace = space;
    }
  }
  return { text, map };
}

export function findPassage(root: Element, quote: string): Range | null {
  const { text, map } = flatten(root);
  const at = text.toLowerCase().indexOf(quote.toLowerCase());
  if (at < 0) return null;
  const a = map[at];
  const b = map[at + quote.length - 1];
  if (!a || !b) return null;
  const range = document.createRange();
  range.setStart(a.node, a.offset);
  range.setEnd(b.node, b.offset + 1);
  return range;
}

type HighlightRegistry = { set(name: string, h: unknown): void; delete(name: string): void };
function registry(): { reg: HighlightRegistry; make: (...r: Range[]) => unknown } | null {
  const reg = (globalThis.CSS as unknown as { highlights?: HighlightRegistry } | undefined)?.highlights;
  const Ctor = (globalThis as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
  return reg && Ctor ? { reg, make: (...r) => new Ctor(...r) } : null;
}

export function paint(name: string, ranges: Range[]): void {
  const r = registry();
  if (!r) return;
  if (ranges.length) r.reg.set(name, r.make(...ranges));
  else r.reg.delete(name);
}

/** Scroll a passage to the middle of the screen (below the fixed header). */
export function scrollToRange(range: Range): void {
  const rect = range.getBoundingClientRect();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight * 0.35, behavior: reduce ? "auto" : "smooth" });
}
