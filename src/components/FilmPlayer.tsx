"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaUrl } from "@/content/media";
import "@/components/txq/pages/pages.css";

/**
 * FilmPlayer — one strong highlight reel (R2). Click-to-play so the heavy video
 * never loads until the visitor asks for it (PERF LAW). Shows the poster in a
 * reserved 16:9 frame with the homepage's hairline play mark until then.
 */
export function FilmPlayer({
  posterKey,
  mp4Key,
  webmKey,
  alt,
}: {
  posterKey?: string;
  mp4Key?: string;
  webmKey?: string;
  alt: string;
}) {
  const poster = mediaUrl(posterKey);
  const mp4 = mediaUrl(mp4Key);
  const webm = mediaUrl(webmKey);
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(mp4 || webm);

  return (
    <div className="tq-pg-film__frame">
      {playing && hasVideo ? (
        <video autoPlay controls playsInline poster={poster ?? undefined}>
          {webm ? <source src={webm} type="video/webm" /> : null}
          {mp4 ? <source src={mp4} type="video/mp4" /> : null}
        </video>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          disabled={!hasVideo}
          aria-label={hasVideo ? "Play highlight film" : "Highlight film coming soon"}
        >
          {poster ? (
            <Image src={poster} alt={alt} fill sizes="100vw" style={{ objectFit: "cover" }} />
          ) : (
            <span className="tq-pg-film__blank" aria-hidden />
          )}
          <span className="tq-pg-play tq-pg-play--lg" aria-hidden>
            <span>
              <svg width="18" height="20" viewBox="0 0 14 16" fill="currentColor">
                <path d="M1 1.5v13L13 8z" />
              </svg>
            </span>
          </span>
          {!hasVideo ? <span className="tq-mono tq-pg-play__note">Film coming soon</span> : null}
        </button>
      )}
    </div>
  );
}
