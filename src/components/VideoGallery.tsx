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
 * Films as a calm, even grid — each a quiet 16:9 still with a single hairline
 * play affordance. No gradients, no clickbait titles burned over the frame:
 * a short editorial caption sits below, matching the photo captions on the page.
 * The whole frame is the tap target (well past the 44px floor); the play glyph
 * is decorative.
 */
export function VideoGallery({ videos }: { videos: DisplayVideo[] }) {
  if (!videos.length) return null;
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}

function PlayGlyph() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/70 bg-ink/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-ink/30 md:h-14 md:w-14">
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

function VideoCard({ video }: { video: DisplayVideo }) {
  const [playing, setPlaying] = useState(false);
  const admin = useIsAdmin();
  const poster = posterFor(video);
  const src = embedSrc(video.provider, video.video_id, video.url);
  const canEmbed = Boolean(src) && video.provider !== "link";

  return (
    <figure className="group">
      <div className="relative aspect-video overflow-hidden bg-ink">
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
            <PlayGlyph />
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
            <PlayGlyph />
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
