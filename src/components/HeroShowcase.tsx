"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroMedia } from "@/lib/content-db";
import "@/components/txq/pages/pages.css";

/**
 * HeroShowcase — the framed visual on the right of the hero. Renders, in order
 * of preference: an admin-set video (YouTube/Vimeo as a silent ambient loop, or
 * a direct .mp4), an admin-set photo, the top featured portfolio photo, or a
 * quiet linen frame. For embeds we paint the poster first and defer mounting
 * the heavy iframe (LCP protection — facade pattern). Set it in /admin/hero.
 */
function ytEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0`;
}
function vimeoEmbed(id: string): string {
  return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`;
}

export function HeroShowcase({
  media,
  fallback,
}: {
  media: HeroMedia | null;
  fallback: { url: string; alt: string } | null;
}) {
  const isEmbed = media?.kind === "video" && (media.provider === "youtube" || media.provider === "vimeo");
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (!isEmbed) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setShowIframe(true), reduce ? 0 : 700);
    return () => window.clearTimeout(t);
  }, [isEmbed]);

  // ---- Video (16:9 frame) ----
  if (media?.kind === "video") {
    const { provider, videoId, videoUrl, posterUrl } = media;
    const iframeSrc =
      provider === "youtube" && videoId
        ? ytEmbed(videoId)
        : provider === "vimeo" && videoId
          ? vimeoEmbed(videoId)
          : null;
    return (
      <div className="tq-pg-show tq-pg-show--video">
        {provider === "file" ? (
          <video src={videoUrl ?? undefined} autoPlay muted loop playsInline poster={posterUrl ?? undefined} />
        ) : (
          <>
            {posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterUrl} alt="" />
            ) : null}
            {showIframe && iframeSrc ? (
              <iframe src={iframeSrc} title="Quinceañera film" allow="autoplay; fullscreen; picture-in-picture" />
            ) : null}
          </>
        )}
      </div>
    );
  }

  // ---- Photo (4:5 portrait frame) ----
  const img =
    media?.kind === "image" && media.imageUrl
      ? { url: media.imageUrl, alt: media.imageAlt }
      : fallback;

  if (img?.url) {
    return (
      <div className="tq-pg-show">
        <Image
          src={img.url}
          alt={img.alt || "Quinceañera portrait"}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  // ---- Empty: linen frame, ratio reserved ----
  return <div className="tq-pg-show" aria-hidden />;
}
