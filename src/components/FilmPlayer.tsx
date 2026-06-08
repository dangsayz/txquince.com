"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaUrl } from "@/content/media";

/**
 * FilmPlayer — one strong highlight reel (R2). Click-to-play so the heavy video
 * never loads until the visitor asks for it (PERF LAW). Shows the poster + a
 * restrained play affordance until then.
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
    <div className="relative aspect-video w-full overflow-hidden bg-ink">
      {playing && hasVideo ? (
        <video
          autoPlay
          controls
          playsInline
          poster={poster ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {webm ? <source src={webm} type="video/webm" /> : null}
          {mp4 ? <source src={mp4} type="video/mp4" /> : null}
        </video>
      ) : (
        <>
          {poster ? (
            <Image src={poster} alt={alt} fill sizes="100vw" className="object-cover" />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 100% at 50% 40%, #3a2128 0%, #1e1417 70%)",
              }}
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-ink/25" aria-hidden />
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={!hasVideo}
            aria-label={hasVideo ? "Play highlight film" : "Highlight film coming soon"}
            className="group absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-cream/70 bg-cream/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-cream/20">
              <span
                className="ml-1 block h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-cream"
                aria-hidden
              />
            </span>
            {!hasVideo ? (
              <span className="absolute bottom-6 eyebrow text-cream/70">
                Film coming soon
              </span>
            ) : null}
          </button>
        </>
      )}
    </div>
  );
}
