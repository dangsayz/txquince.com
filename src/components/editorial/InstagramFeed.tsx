"use client";

import Link from "next/link";
import { useSite } from "@/components/txq/state";
import { SocialIcon } from "@/components/owners/Owners";
import { site } from "@/content/site";
import { altFor, displayCount, excerptFor, type InstagramTile } from "@/lib/instagram-shared";
import "./instagram.css";

/**
 * "Latest on Instagram" — the newest @txquince posts as a quiet square grid in
 * the editorial type, with a light nod to Instagram (handle, icon, a play mark
 * on videos) and none of its chrome. Each tile opens the post on Instagram in
 * a new tab; the section's main action stays on the site (Check your date).
 *
 * Posts come from R2 via the server (never from Instagram in the browser).
 * Fewer than six posts — or none at all, when the feed has never synced —
 * renders nothing, so the grid is never ragged or broken.
 */
const COPY = {
  en: {
    title: "Latest on Instagram",
    dek: "Quinceañeras we’ve photographed and filmed lately across Dallas–Fort Worth, as we post them.",
    cta: "Check your date",
    ctaHref: "/check-your-date",
    follow: "Follow on Instagram",
    newTab: "Opens Instagram in a new tab",
    video: "Video",
  },
  es: {
    title: "Lo más reciente en Instagram",
    dek: "Las quinceañeras que hemos fotografiado y filmado últimamente en Dallas–Fort Worth, tal como las publicamos.",
    cta: "Consulta tu fecha",
    ctaHref: "/es/consulta",
    follow: "Síguenos en Instagram",
    newTab: "Se abre Instagram en una pestaña nueva",
    video: "Video",
  },
} as const;

const HANDLE = "@txquince";
const SIZES = "(min-width: 1440px) 440px, (min-width: 640px) 31vw, 46vw";

export function InstagramFeed({ posts }: { posts: InstagramTile[] }) {
  const { lang } = useSite();
  const t = COPY[lang];
  const shown = posts.slice(0, displayCount(posts.length));
  if (!shown.length) return null;

  return (
    <section className="ig" aria-labelledby="ig-title">
      <div className="ed-wrap">
        <header className="ig-head">
          <p className="ed-label ig-handle">
            <SocialIcon name="instagram" /> {HANDLE}
          </p>
          <h2 id="ig-title" className="ed-display ed-display--lg">
            {t.title}
          </h2>
          <p className="ed-dek">{t.dek}</p>
        </header>

        <ul className="ig-grid" data-count={shown.length}>
          {shown.map((p) => {
            const excerpt = excerptFor(p.caption);
            return (
              <li key={p.id}>
                <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="ig-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    srcSet={p.srcSet}
                    sizes={p.srcSet ? SIZES : undefined}
                    width={1080}
                    height={1080}
                    alt={altFor(p, lang)}
                    loading="lazy"
                    decoding="async"
                  />
                  {p.kind === "video" && (
                    <span className="ig-play" aria-hidden>
                      <svg width="12" height="12" viewBox="0 0 16 16" focusable="false">
                        <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />
                      </svg>
                    </span>
                  )}
                  {excerpt && (
                    <span className="ig-cap" aria-hidden>
                      {excerpt}
                    </span>
                  )}
                  <span className="ig-sr">
                    {p.kind === "video" ? `${t.video}. ` : ""}
                    {t.newTab}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ig-actions">
          <Link href={t.ctaHref} className="ed-btn">
            {t.cta}
          </Link>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="ed-textlink ig-follow">
            <SocialIcon name="instagram" /> {t.follow}
          </a>
        </div>
      </div>
    </section>
  );
}
