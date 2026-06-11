"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { mediaUrl } from "@/content/media";

/**
 * HeroMedia — full-bleed background for the hero (PERF LAW).
 * With a poster: the still is the LCP element, video lazy-loads after on desktop,
 * and a soft dark scrim keeps white text legible. Without a poster: a light, airy
 * cream/blush field (NOT a heavy dark void) so the hero reads clean and editorial
 * even before real imagery is uploaded.
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
    const wantsMotion = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!wantsMotion || !isDesktop) return;
    const t = window.setTimeout(() => setMountVideo(true), 600);
    return () => window.clearTimeout(t);
  }, [mp4, webm]);

  // ---- Empty state: light, airy editorial field ----
  if (!poster) {
    return (
      <div className="absolute inset-0 -z-10 bg-cream">
        <div
          className="grain absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(80% 70% at 72% 18%, #fbf2ec 0%, #f3e7da 46%, #e9d7c6 100%)",
          }}
        />
        {/* whisper-soft vignette to seat the type */}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(120,90,70,0.10) 100%)",
          }}
        />
      </div>
    );
  }

  // ---- With a real photo ----
  return (
    <div className="absolute inset-0 -z-10 bg-ink">
      <Image
        src={poster}
        alt={posterAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {mountVideo && (mp4 || webm) ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {webm ? <source src={webm} type="video/webm" /> : null}
          {mp4 ? <source src={mp4} type="video/mp4" /> : null}
        </video>
      ) : null}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,16,14,0.34) 0%, rgba(20,16,14,0.18) 40%, rgba(20,16,14,0.5) 100%)",
        }}
      />
    </div>
  );
}
