"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroMedia } from "@/lib/content-db";

/**
 * HeroShowcase — the framed visual on the right of the hero. Renders, in order
 * of preference: an admin-set video (YouTube/Vimeo as a silent ambient loop, or
 * a direct .mp4), an admin-set photo, the top featured portfolio photo, or a
 * soft Claura gradient. For embeds we paint the poster first and defer mounting
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

  // ---- Video (16:9 cinematic card) ----
  if (media?.kind === "video") {
    const { provider, videoId, videoUrl, posterUrl } = media;
    const iframeSrc =
      provider === "youtube" && videoId
        ? ytEmbed(videoId)
        : provider === "vimeo" && videoId
          ? vimeoEmbed(videoId)
          : null;
    return (
      <div className="relative flex min-h-[16rem] items-center justify-center md:min-h-[34rem]">
        <div className="fade-in-soft relative aspect-video w-full max-w-[22rem] overflow-hidden rounded-[2rem] bg-ink shadow-[0_30px_70px_-30px_rgba(60,40,20,0.5)] md:ml-auto md:max-w-[34rem]">
          {provider === "file" ? (
            <video
              src={videoUrl ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              poster={posterUrl ?? undefined}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              {posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              {showIframe && iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  title="Quinceañera film"
                  allow="autoplay; fullscreen; picture-in-picture"
                  className="fade-in-soft absolute inset-0 h-full w-full"
                  style={{ border: 0 }}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- Photo (tall portrait card) ----
  const img =
    media?.kind === "image" && media.imageUrl
      ? { url: media.imageUrl, alt: media.imageAlt }
      : fallback;

  if (img?.url) {
    return (
      <div className="relative min-h-[18rem] md:min-h-[34rem]">
        <div className="fade-in-soft absolute left-1/2 top-1/2 h-[20rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] shadow-[0_30px_70px_-30px_rgba(60,40,20,0.5)] md:left-auto md:right-[-6%] md:h-[36rem] md:w-[30rem] md:translate-x-0">
          <Image
            src={img.url}
            alt={img.alt || "Quinceañera portrait"}
            fill
            priority
            sizes="(max-width: 768px) 90vw, 32rem"
            className="ken-burns object-cover"
          />
        </div>
      </div>
    );
  }

  // ---- Empty: soft Claura gradient ----
  return (
    <div className="relative min-h-[18rem] md:min-h-[34rem]">
      <div
        className="claura-art fade-in-soft absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 opacity-95 blur-[0.5px] md:left-auto md:right-[-12%] md:h-[34rem] md:w-[34rem] md:translate-x-0"
        style={{ borderRadius: "46% 54% 52% 48% / 56% 44% 56% 44%" }}
      />
    </div>
  );
}
