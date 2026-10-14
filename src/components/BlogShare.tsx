"use client";

import { useEffect, useRef, useState } from "react";
import { SHARE_ICONS } from "@/components/ShareModal";
import { trackEvent } from "@/components/Tracker";

/**
 * Inline share row for a journal post (EN + ES): the phone's own share sheet
 * when the browser has one, Copy link (with "Copied!" feedback), Facebook,
 * WhatsApp, X, Pinterest (pins the cover photo) and Email. Every control is a
 * 44px square hairline target (8px apart) with a spoken label.
 */

type Lang = "en" | "es";

const COPY = {
  en: {
    label: "Share this guide",
    copy: "Copy link",
    copied: "Copied!",
    native: "Share",
    nativeAria: "Share with your phone's apps",
    on: (n: string) => `Share on ${n}`,
    email: "Send by email",
    emailBody: (title: string, url: string) => `I thought you'd like this: ${title}\n\n${url}`,
  },
  es: {
    label: "Comparte esta guía",
    copy: "Copiar enlace",
    copied: "¡Copiado!",
    native: "Compartir",
    nativeAria: "Compartir con las apps de tu teléfono",
    on: (n: string) => `Compartir en ${n}`,
    email: "Enviar por correo",
    emailBody: (title: string, url: string) => `Pensé que te gustaría esto: ${title}\n\n${url}`,
  },
} as const;

export function BlogShare({
  url,
  title,
  image,
  lang,
  placement,
}: {
  /** Absolute canonical URL of the post. */
  url: string;
  title: string;
  /** Absolute cover image URL (Pinterest needs a picture). */
  image?: string;
  lang: Lang;
  /** "top" (under the title) or "end" (after the article) — for analytics. */
  placement: "top" | "end";
}) {
  const c = COPY[lang];
  const [canNative, setCanNative] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Feature-detect after mount (navigator is client-only). The native button
    // sits LAST in the row, so revealing it never shifts the other buttons.
    const ok = typeof navigator !== "undefined" && typeof navigator.share === "function";
    queueMicrotask(() => setCanNative(ok));
    return () => window.clearTimeout(timer.current);
  }, []);

  const enc = encodeURIComponent;
  const channels = [
    { key: "facebook", name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: SHARE_ICONS.facebook },
    { key: "whatsapp", name: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}`, icon: SHARE_ICONS.whatsapp },
    { key: "x", name: "X", href: `https://x.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`, icon: SHARE_ICONS.x },
    {
      key: "pinterest",
      name: "Pinterest",
      href: `https://www.pinterest.com/pin/create/button/?url=${enc(url)}${image ? `&media=${enc(image)}` : ""}&description=${enc(title)}`,
      icon: SHARE_ICONS.pinterest,
    },
  ] as const;

  function track(target: string) {
    trackEvent("share", `blog-${placement}:${target}`);
  }

  async function copyLink() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // Older/locked-down browsers: fall back to a hidden textarea.
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    if (!ok) return;
    track("copy");
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
      track("native");
    } catch {
      /* dismissed */
    }
  }

  return (
    <div className="tq-blog-share" data-placement={placement}>
      <p className="tq-blog-share__label tq-mono">{c.label}</p>
      <ul className="tq-blog-share__list">
        <li>
          <button
            type="button"
            className="tq-blog-share__btn tq-blog-share__btn--text"
            onClick={copyLink}
            data-copied={copied ? "true" : undefined}
          >
            <span className="tq-blog-share__icon" aria-hidden>
              {SHARE_ICONS.link}
            </span>
            {/* Both labels share one grid cell so the button never changes width. */}
            <span className="tq-blog-share__swap">
              <span data-on={copied ? undefined : "true"}>{c.copy}</span>
              <span data-on={copied ? "true" : undefined} aria-hidden>
                {c.copied}
              </span>
            </span>
            <span className="tq-sr" aria-live="polite">
              {copied ? c.copied : ""}
            </span>
          </button>
        </li>
        {channels.map((ch) => (
          <li key={ch.key}>
            <a
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="tq-blog-share__btn"
              aria-label={c.on(ch.name)}
              title={c.on(ch.name)}
              onClick={() => track(ch.key)}
            >
              <span className="tq-blog-share__icon" aria-hidden>
                {ch.icon}
              </span>
            </a>
          </li>
        ))}
        <li>
          <a
            href={`mailto:?subject=${enc(title)}&body=${enc(c.emailBody(title, url))}`}
            className="tq-blog-share__btn"
            aria-label={c.email}
            title={c.email}
            onClick={() => track("email")}
          >
            <span className="tq-blog-share__icon" aria-hidden>
              {SHARE_ICONS.email}
            </span>
          </a>
        </li>
        {canNative ? (
          <li>
            <button
              type="button"
              className="tq-blog-share__btn tq-blog-share__btn--text"
              onClick={nativeShare}
              aria-label={c.nativeAria}
            >
              <span className="tq-blog-share__icon" aria-hidden>
                {SHARE_ICONS.share}
              </span>
              <span>{c.native}</span>
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
