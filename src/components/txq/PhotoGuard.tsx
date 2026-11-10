"use client";

import { useEffect } from "react";

/**
 * PhotoGuard — takes away the easy ways to save a photo on the public site:
 * right-click "Save image as", dragging a photo to the desktop, and (with the
 * CSS in txq.css) the long-press "Save to Photos" sheet on phones.
 *
 * It is a deterrent, not a lock: the real protection is upstream (/api/img
 * only ever serves capped, EXIF-stripped copies and refuses hotlinks).
 * Sharing is untouched: the share buttons, link previews and Pinterest all
 * work from the page URL, not from the menu this removes.
 *
 * One delegated listener on the shell, so every photo added later is covered
 * without wiring anything per image. Text, links and form fields keep their
 * normal menus.
 */
export function PhotoGuard() {
  useEffect(() => {
    const root = document.querySelector(".txq");
    if (!root) return;
    const isPhoto = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest("img, picture, video, canvas"));
    const block = (e: Event) => {
      if (isPhoto(e.target)) e.preventDefault();
    };
    root.addEventListener("contextmenu", block);
    root.addEventListener("dragstart", block);
    return () => {
      root.removeEventListener("contextmenu", block);
      root.removeEventListener("dragstart", block);
    };
  }, []);
  return null;
}
