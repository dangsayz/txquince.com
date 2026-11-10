/**
 * shrink-clip.ts — turn any video the browser can read (a big MP4, an iPhone
 * .mov) into a small silent H.264 MP4 loop, right in the admin's browser.
 *
 * Why here and not on the server: a Worker cannot transcode video, and a
 * 50 MB background clip would slow the homepage for every family. So the
 * file is re-encoded before upload: at most 1920px on its long side, 30 fps,
 * no sound, no camera metadata (iPhone clips carry GPS), sized to land well
 * under MAX_CLIP_BYTES. A clip longer than a loop keeps its first seconds.
 *
 * Loaded on demand (admin only); visitors never download it.
 */
import { LOOP_SECONDS, MAX_CLIP_BYTES, MAX_CLIP_SECONDS } from "@/lib/home-clip-shared";

/** Aim below the cap: encoders overshoot their bitrate a little. */
const TARGET_BYTES = Math.round(MAX_CLIP_BYTES * 0.7);
const MAX_BITRATE = 6_000_000;
const LONG_SIDE = 1920;

export type Shrunk = { blob: Blob; seconds: number; trimmedFrom: number | null };

export class ShrinkError extends Error {
  name = "ShrinkError";
}

const CANNOT_READ = "This browser cannot read that video. Export it as an MP4 (H.264) and try again.";
const CANNOT_ENCODE = "This browser cannot make the video smaller. Use Chrome or Safari on a computer, or export it under 12 MB.";

export async function shrinkClip(file: File, onProgress: (fraction: number) => void): Promise<Shrunk> {
  if (typeof VideoEncoder === "undefined") throw new ShrinkError(CANNOT_ENCODE);
  const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } = await import("mediabunny");

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  let track, full: number;
  try {
    track = await input.getPrimaryVideoTrack();
    full = await input.computeDuration();
  } catch {
    throw new ShrinkError(CANNOT_READ);
  }
  if (!track || !(full > 0)) throw new ShrinkError(CANNOT_READ);

  const trimmed = full > MAX_CLIP_SECONDS;
  const seconds = trimmed ? LOOP_SECONDS : full;
  const landscape = track.displayWidth >= track.displayHeight;
  const long = Math.max(track.displayWidth, track.displayHeight);
  const size = long > LONG_SIDE ? (landscape ? { width: LONG_SIDE } : { height: LONG_SIDE }) : {};

  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  const conversion = await Conversion.init({
    input,
    output,
    tracks: "primary",
    trim: trimmed ? { start: 0, end: LOOP_SECONDS } : undefined,
    video: {
      ...size,
      codec: "avc",
      frameRate: 30,
      bitrate: Math.min(MAX_BITRATE, Math.floor((TARGET_BYTES * 8) / seconds)),
      keyFrameInterval: 2,
      forceTranscode: true,
    },
    audio: { discard: true },
    tags: () => ({}),
    showWarnings: false,
  });
  if (!conversion.isValid) throw new ShrinkError(CANNOT_ENCODE);
  conversion.onProgress = (p) => onProgress(p);
  try {
    await conversion.execute();
  } catch {
    throw new ShrinkError(CANNOT_ENCODE);
  }
  const buffer = output.target.buffer;
  if (!buffer?.byteLength) throw new ShrinkError(CANNOT_ENCODE);
  if (buffer.byteLength > MAX_CLIP_BYTES) {
    throw new ShrinkError("That video is still too large after shrinking. Cut it to 8 to 12 seconds and try again.");
  }
  return { blob: new Blob([buffer], { type: "video/mp4" }), seconds, trimmedFrom: trimmed ? full : null };
}
