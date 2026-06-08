"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { mediaUrl } from "@/content/media";

/**
 * HeroMedia — the background layer for the hero (PERF LAW).
 * The poster still is the LCP element (priority). The compressed, muted, looping
 * video lazy-loads AFTER mount and only on larger screens; mobile keeps the
 * still. Never lets the film block LCP.
 */
export function HeroMedia({
  posterKey,
  posterAlt,
  videoMp4Key,
  videoWebmKey,
}: {
  posterKey?: string;
  posterAlt: string;
  videoMp4Key?: string;
  videoWebmKey?: string;
}) {
  const poster = mediaUrl(posterKey);
  const mp4 = mediaUrl(videoMp4Key);
  const webm = mediaUrl(videoWebmKey);
  const [mountVideo, setMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!mp4 && !webm) return;
    // Desktop only + respect reduced motion. Defer until after first paint.
    const wantsMotion = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!wantsMotion || !isDesktop) return;
    const t = window.setTimeout(() => setMountVideo(true), 600);
    return () => window.clearTimeout(t);
  }, [mp4, webm]);

  return (
    <div className="absolute inset-0 -z-10 bg-ink">
      {poster ? (
        <Image
          src={poster}
          alt={posterAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        // Premium gradient placeholder until the release-cleared poster is on R2.
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 18%, #5b3540 0%, #3a2128 42%, #1e1417 100%)",
          }}
          aria-hidden
        />
      )}

      {mountVideo && (mp4 || webm) ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={poster ?? undefined}
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {webm ? <source src={webm} type="video/webm" /> : null}
          {mp4 ? <source src={mp4} type="video/mp4" /> : null}
        </video>
      ) : null}

      {/* Subtle dark overlay so headline text stays legible over media. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,16,14,0.42) 0%, rgba(20,16,14,0.28) 38%, rgba(20,16,14,0.62) 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
