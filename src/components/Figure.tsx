import Image from "next/image";
import { mediaUrl } from "@/content/media";

type Ratio = "portrait" | "landscape" | "square";

const RATIO: Record<Ratio, string> = {
  portrait: "3 / 4",
  landscape: "3 / 2",
  square: "1 / 1",
};

/** Deterministic neutral placeholders until a released photograph is available. */
const FIELDS: { bg: string; fg: string }[] = [
  { bg: "#f5f5f5", fg: "#676767" },
  { bg: "#ededed", fg: "#676767" },
  { bg: "#e6e6e6", fg: "#676767" },
];

function fieldFor(seed: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FIELDS[h % FIELDS.length];
}

/** Renders released media or a neutral placeholder while preserving its ratio. */
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
  /** Direct resolved URL (e.g. Supabase Storage). Takes precedence over imageKey. */
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
      <div
        className={`relative overflow-hidden bg-greige ${className}`}
        style={{ aspectRatio: RATIO[ratio] }}
      >
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const field = fieldFor(alt + ratio);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: RATIO[ratio], background: field.bg }}
      role="img"
      aria-label={alt}
    >
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <span
          className="font-display"
          style={{
            color: field.fg,
            opacity: 0.45,
            fontSize: "clamp(1.8rem, 5vw, 4rem)",
            letterSpacing: "-0.04em",
          }}
        >
          TX
        </span>
      </div>
    </div>
  );
}
