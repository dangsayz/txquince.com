"use client";

import { useEffect, useRef } from "react";

/**
 * Makes the article's contents list live: marks the section being read
 * (aria-current on its link), slides the ink marker beside it, and keeps the
 * "2 / 4" count in step. It renders nothing visible; it works on the <nav> it
 * sits in, so the list itself stays server-rendered and works without script.
 */
export function TocSpy({ ids }: { ids: string[] }) {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nav = anchor.current?.parentElement;
    const list = nav?.querySelector<HTMLElement>(".tq-blog-toc__list");
    const count = nav?.querySelector<HTMLElement>("[data-toc-count]");
    if (!nav || !list) return;
    const links = ids.map((id) => list.querySelector<HTMLAnchorElement>(`a[href="#${CSS.escape(id)}"]`));
    const heads = ids.map((id) => document.getElementById(id));
    let current = -2;
    let frame = 0;

    const update = () => {
      frame = 0;
      // The section whose heading has passed the reading line (under the header).
      const line = 140;
      let active = -1;
      heads.forEach((h, i) => {
        if (h && h.getBoundingClientRect().top <= line) active = i;
      });
      if (active === current) return;
      current = active;
      links.forEach((a, i) => {
        if (!a) return;
        if (i === active) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
      const a = active >= 0 ? links[active] : null;
      list.style.setProperty("--tq-toc-y", `${a ? a.offsetTop : 0}px`);
      list.style.setProperty("--tq-toc-h", `${a ? a.offsetHeight : 0}px`);
      if (count) count.textContent = `${Math.max(active, 0) + (active >= 0 ? 1 : 0)} / ${ids.length}`;
      // Keep the active line inside the list when the list itself scrolls.
      if (a && list.scrollHeight > list.clientHeight) {
        const top = a.offsetTop;
        const bottom = top + a.offsetHeight;
        if (top < list.scrollTop) list.scrollTop = top;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return <span ref={anchor} hidden />;
}
