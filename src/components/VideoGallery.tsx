"use client";

import { useState } from "react";
import { embedSrc, type VideoProvider } from "@/lib/video";
import { Reveal } from "@/components/Reveal";

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
 * Editorial film display: one large feature reel + a supporting pair.
 * YouTube/Vimeo/file play inline on click; album-style links open out.
 */
export function VideoGallery({ videos }: { videos: DisplayVideo[] }) {
  if (!videos.length) return null;
  const [feature, ...rest] = videos;
  return (
    <div className="flex flex-col gap-5">
      <Reveal>
        <VideoCard video={feature} large />
      </Reveal>
      {rest.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {rest.map((v, i) => (
            <Reveal key={v.id} delay={i * 80}>
              <VideoCard video={v} />
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VideoCard({ video, large = false }: { video: DisplayVideo; large?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const poster = posterFor(video);
  const src = embedSrc(video.provider, video.video_id, video.url);
  const canEmbed = Boolean(src) && video.provider !== "link";

  return (
    <figure className="group relative overflow-hidden bg-ink">
      <div className={large ? "aspect-video" : "aspect-video"}>
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
        ) : (
          <>
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt={video.title || "Quinceañera film still"}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(120% 100% at 50% 40%,#2a2420,#161412)" }}
              />
            )}
            <div className="absolute inset-0 bg-ink/25" />
            {canEmbed ? (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play ${video.title || "film"}`}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-cream/70 bg-cream/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-cream/20 md:h-20 md:w-20">
                  <span className="ml-1 h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-cream" />
                </span>
              </button>
            ) : (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="btn-pill text-cream backdrop-blur-sm hover:bg-cream hover:text-ink">
                  Watch the film
                </span>
              </a>
            )}
          </>
        )}
      </div>
      {video.title ? (
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent p-5 pt-10">
          <span className="accent text-lg text-cream md:text-xl">{video.title}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
