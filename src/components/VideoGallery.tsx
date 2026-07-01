"use client";

import { useState } from "react";
import { embedSrc, type VideoProvider } from "@/lib/video";
import { InlineCaption } from "@/components/InlineCaption";
import { useIsAdmin } from "@/components/EditMode";

/** Admin-only: persist an edited video caption (its title). */
async function saveVideoTitle(id: string, title: string) {
  await fetch("/api/admin/videos", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, title }),
  });
}

export type DisplayVideo = {
  id: string;
  url: string;
  provider: VideoProvider;
  video_id: string | null;
  title: string;
  poster_url: string | null;
};

function posterFor(v: DisplayVideo): string | null {
  if (v.poster_url) return v.poster_url;
  if (v.provider === "youtube" && v.video_id)
    return `https://i.ytimg.com/vi/${v.video_id}/maxresdefault.jpg`;
  return null;
}

/**
 * Films as a calm, even grid — each a quiet still with a single hairline
 * play affordance. No gradients, no clickbait titles burned over the frame:
 * a short editorial caption sits below, matching the photo captions on the page.
 * The whole frame is the tap target (well past the 44px floor); the play glyph
 * is decorative.
 *
 * `variant="vertical"` renders the same cards at 9:16 (shorts/reels) in a
 * denser grid instead of the default 16:9 film layout.
 */
export function VideoGallery({
  videos,
  variant = "landscape",
}: {
  videos: DisplayVideo[];
  variant?: "landscape" | "vertical";
}) {
  if (!videos.length) return null;
  const gridClass =
    variant === "vertical"
      ? "grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4"
      : "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={gridClass}>
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} variant={variant} />
      ))}
    </div>
  );
}

function PlayGlyph({ compact = false }: { compact?: boolean }) {
  const size = compact ? "h-11 w-11 md:h-12 md:w-12" : "h-12 w-12 md:h-14 md:w-14";
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span
        className={`flex items-center justify-center rounded-full border border-cream/70 bg-ink/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-ink/30 ${size}`}
      >
        <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-cream" />
      </span>
    </span>
  );
}

function Thumb({ poster, title }: { poster: string | null; title: string }) {
  return (
    <>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={title || "Quinceañera film still"}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 100% at 50% 40%,#2a2420,#161412)" }}
        />
      )}
      <span className="absolute inset-0 bg-ink/10" />
    </>
  );
}

function VideoCard({
  video,
  variant = "landscape",
}: {
  video: DisplayVideo;
  variant?: "landscape" | "vertical";
}) {
  const [playing, setPlaying] = useState(false);
  const admin = useIsAdmin();
  const poster = posterFor(video);
  const src = embedSrc(video.provider, video.video_id, video.url);
  const canEmbed = Boolean(src) && video.provider !== "link";
  const frameClass = variant === "vertical" ? "aspect-[9/16]" : "aspect-video";

  return (
    <figure className="group">
      <div className={`relative overflow-hidden bg-ink ${frameClass}`}>
        {playing && canEmbed ? (
          video.provider === "file" ? (
            <video src={src!} controls autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <iframe
              src={src!}
              title={video.title || "Film"}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          )
        ) : canEmbed ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${video.title || "film"}`}
            className="absolute inset-0 block"
          >
            <Thumb poster={poster} title={video.title} />
            <PlayGlyph compact={variant === "vertical"} />
          </button>
        ) : (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${video.title || "film"}`}
            className="absolute inset-0 block"
          >
            <Thumb poster={poster} title={video.title} />
            <PlayGlyph compact={variant === "vertical"} />
          </a>
        )}
      </div>
      {video.title || admin ? (
        <figcaption className="mt-3 text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
          <InlineCaption
            value={video.title}
            placeholder="Add caption"
            onSave={(next) => saveVideoTitle(video.id, next)}
          />
        </figcaption>
      ) : null}
    </figure>
  );
}
