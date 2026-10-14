"use client";

import { useState } from "react";
import { embedSrc, type VideoProvider } from "@/lib/video";
import { InlineCaption } from "@/components/InlineCaption";
import { useIsAdmin } from "@/components/EditMode";
import "@/components/txq/pages/pages.css";

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
 * Films as a calm, even grid on the hairline system — each a still in a
 * reserved 16:9 (or 9:16) frame with the homepage's round hairline play mark,
 * and a mono-indexed caption below. The whole frame is the tap target; the
 * heavy embed only mounts on play (facade pattern).
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
  return (
    <ul className={`tq-pg-films ${variant === "vertical" ? "tq-pg-films--vertical" : ""}`}>
      {videos.map((v, i) => (
        <li key={v.id}>
          <VideoCard video={v} variant={variant} index={i} />
        </li>
      ))}
    </ul>
  );
}

function PlayGlyph() {
  return (
    <span className="tq-pg-play" aria-hidden>
      <span>
        <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
          <path d="M1 1.5v13L13 8z" />
        </svg>
      </span>
    </span>
  );
}

function Thumb({ poster, title }: { poster: string | null; title: string }) {
  return poster ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={poster} alt={title || "Quinceañera film still"} loading="lazy" decoding="async" />
  ) : (
    <span className="tq-pg-film__blank" />
  );
}

function VideoCard({
  video,
  variant = "landscape",
  index,
}: {
  video: DisplayVideo;
  variant?: "landscape" | "vertical";
  index: number;
}) {
  const [playing, setPlaying] = useState(false);
  const admin = useIsAdmin();
  const poster = posterFor(video);
  const src = embedSrc(video.provider, video.video_id, video.url);
  const canEmbed = Boolean(src) && video.provider !== "link";

  return (
    <figure className="tq-pg-film">
      <div className={`tq-pg-film__frame ${variant === "vertical" ? "tq-pg-film__frame--vertical" : ""}`}>
        {playing && canEmbed ? (
          video.provider === "file" ? (
            <video src={src!} controls autoPlay playsInline />
          ) : (
            <iframe
              src={src!}
              title={video.title || "Film"}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )
        ) : canEmbed ? (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${video.title || "film"}`}>
            <Thumb poster={poster} title={video.title} />
            <PlayGlyph />
          </button>
        ) : (
          <a href={video.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${video.title || "film"}`}>
            <Thumb poster={poster} title={video.title} />
            <PlayGlyph />
          </a>
        )}
      </div>
      {video.title || admin ? (
        <figcaption className="tq-pg-film__cap">
          <span className="tq-mono">[{String(index + 1).padStart(2, "0")}]</span>
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
