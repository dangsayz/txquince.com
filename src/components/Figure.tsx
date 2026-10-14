import Image from "next/image";
import { mediaUrl } from "@/content/media";

type Ratio = "portrait" | "landscape" | "square";

const RATIO: Record<Ratio, string> = {
  portrait: "3 / 4",
  landscape: "3 / 2",
  square: "1 / 1",
};

const frame = {
  position: "relative",
  overflow: "hidden",
  background: "var(--bg-surface, #f2efe9)",
} as const;

/** Renders released media or a neutral linen placeholder while preserving its ratio (no CLS). */
export function Figure({
  imageKey,
  src,
  alt,
  ratio = "portrait",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className = "",
}: {
  imageKey?: string;
  /** Direct resolved media URL. Takes precedence over imageKey. */
  src?: string | null;
  alt: string;
  ratio?: Ratio;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const url = src ?? mediaUrl(imageKey);

  if (url) {
    return (
      <div className={className} style={{ ...frame, aspectRatio: RATIO[ratio] }}>
        <Image src={url} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div className={className} style={{ ...frame, aspectRatio: RATIO[ratio] }} role="img" aria-label={alt}>
      <span
        className="tq-mono tq-muted"
        aria-hidden
        style={{ position: "absolute", left: 16, bottom: 12 }}
      >
        [TX Quince]
      </span>
    </div>
  );
}
