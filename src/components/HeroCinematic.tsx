"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroMedia } from "@/lib/content-db";

/**
 * HeroCinematic — the full-bleed homepage hero. The photograph (or film) IS the
 * screen; headline, CTAs, and proof chips sit on a bottom scrim. Renders, in
 * order of preference: the admin-set hero (photo or video from /admin/hero),
 * the top featured portfolio photo, or the Claura gradient.
 *
 * LCP discipline: the photo/poster paints first via next/image `priority`;
 * video iframes mount ~700ms later behind the poster (facade pattern), so the
 * largest paint is always a prioritized, optimized image.
 */
function ytEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0`;
}
function vimeoEmbed(id: string): string {
  return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`;
}

export function HeroCinematic({
  media,
  fallback,
  headline1,
  headline2,
  subline,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  chips,
}: {
  media: HeroMedia | null;
  fallback: { url: string; alt: string } | null;
  headline1: string;
  headline2: string;
  subline: string;
  ctaHref: string;
  ctaLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  /** Short proof fragments rendered as a dot-separated row on the scrim. */
  chips: string[];
}) {
  const isEmbed =
    media?.kind === "video" && (media.provider === "youtube" || media.provider === "vimeo");
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (!isEmbed) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setShowIframe(true), reduce ? 0 : 700);
    return () => window.clearTimeout(t);
  }, [isEmbed]);

  // The still that paints first (and stays, for photo heroes).
  const still =
    media?.kind === "image" && media.imageUrl
      ? { url: media.imageUrl, alt: media.imageAlt }
      : media?.kind === "video" && media.posterUrl
        ? { url: media.posterUrl, alt: "Quinceañera film still" }
        : fallback;

  const iframeSrc =
    media?.kind === "video" && media.provider === "youtube" && media.videoId
      ? ytEmbed(media.videoId)
      : media?.kind === "video" && media.provider === "vimeo" && media.videoId
        ? vimeoEmbed(media.videoId)
        : null;

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-ink">
      {/* ---- media layer ---- */}
      {media?.kind === "video" && media.provider === "file" ? (
        <video
          src={media.videoUrl ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          poster={media.posterUrl ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          {still?.url ? (
            <Image
              src={still.url}
              alt={still.alt || "Quinceañera portrait"}
              fill
              priority
              sizes="100vw"
              className={`object-cover ${media?.kind === "video" ? "" : "ken-burns"}`}
            />
          ) : (
            <div className="claura-art absolute inset-0 opacity-90" />
          )}
          {showIframe && iframeSrc ? (
            // Center-cover the 16:9 embed regardless of viewport shape.
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[max(100svh,56.25vw)] w-[max(100vw,163.6svh)] -translate-x-1/2 -translate-y-1/2">
              <iframe
                src={iframeSrc}
                title="Quinceañera film"
                allow="autoplay; fullscreen; picture-in-picture"
                className="fade-in-soft h-full w-full"
                style={{ border: 0 }}
              />
            </div>
          ) : null}
        </>
      )}

      {/* ---- legibility scrims (photo stays the star) ---- */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10" />

      {/* ---- content on the scrim ---- */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-7xl px-5 pb-12 md:px-8 md:pb-16">
          <div className="hero-enter hero-delay-1 flex items-center gap-3">
            <span className="script text-cream/90" style={{ fontSize: "1.6rem", lineHeight: 1 }}>
              Para siempre
            </span>
            <span aria-hidden className="h-px w-7 bg-cream/40" />
            <span className="text-[0.66rem] uppercase tracking-[0.28em] text-cream/70">
              Dallas–Fort Worth
            </span>
          </div>

          <h1 className="hero-enter hero-delay-2 mt-5 max-w-3xl text-balance">
            <span
              className="block font-display text-cream"
              style={{ fontSize: "clamp(2.4rem,5.6vw,4.6rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
            >
              {headline1}
            </span>
            {headline2 ? (
              <span
                className="mt-1 block font-display italic text-cream/85"
                style={{ fontSize: "clamp(2rem,4.6vw,3.8rem)", lineHeight: 1.05 }}
              >
                {headline2}
              </span>
            ) : null}
          </h1>

          <p className="hero-enter hero-delay-3 mt-5 max-w-md text-base leading-relaxed text-cream/85">
            {subline}
          </p>

          <div className="hero-enter hero-delay-4 mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={ctaHref}
              className="rounded-full bg-cream px-7 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white"
            >
              {ctaLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="rounded-full border border-cream/50 px-7 py-3.5 text-[0.72rem] uppercase tracking-[0.16em] text-cream transition-colors hover:border-cream hover:bg-cream/10"
            >
              {secondaryLabel}
            </Link>
          </div>

          {/* proof chips — one quiet line, no badges */}
          <p className="hero-enter hero-delay-5 mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-cream/80">
            {chips.map((c, i) => (
              <span key={c} className="flex items-center gap-3">
                {i > 0 ? <span aria-hidden className="h-1 w-1 rounded-full bg-cream/40" /> : null}
                {c}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
