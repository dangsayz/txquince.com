import Image from "next/image";
import { mediaUrl } from "@/content/media";

type Ratio = "portrait" | "landscape" | "square";

const RATIO: Record<Ratio, string> = {
  portrait: "3 / 4",
  landscape: "3 / 2",
  square: "1 / 1",
};

/**
 * Art-directed placeholder fields in the brand palette. Until real release-cleared
 * media is on R2, these read as intentional editorial color fields (not broken
 * gray boxes). Deterministic per-alt so SSR and client match (no hydration shift).
 */
// Light, airy duotones to match the editorial aesthetic — with one champagne-gold
// accent for rhythm. Real release-cleared photos replace these instantly.
const FIELDS: { bg: string; fg: string }[] = [
  { bg: "linear-gradient(150deg,#f1e5d8 0%,#ddc6b2 100%)", fg: "#5b4a2c" }, // sand
  { bg: "linear-gradient(150deg,#f2e1d9 0%,#d9b7a9 100%)", fg: "#5b4a2c" }, // blush
  { bg: "linear-gradient(150deg,#e8dac9 0%,#c4a791 100%)", fg: "#4a3f2e" }, // taupe
  { bg: "linear-gradient(150deg,#ecdcd3 0%,#bd968c 100%)", fg: "#4a3f2e" }, // rose-taupe
  { bg: "linear-gradient(150deg,#e0d3c5 0%,#b39c88 100%)", fg: "#3f352a" }, // greige
  { bg: "linear-gradient(150deg,#8a6f43 0%,#5b4a2c 100%)", fg: "#f3ecde" }, // champagne-gold accent
];

function fieldFor(seed: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FIELDS[h % FIELDS.length];
}

/**
 * Figure — renders a release-cleared R2 image, or an elegant placeholder field
 * when no media is set yet. ALT TEXT is required (accessibility + image SEO).
 */
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
      className={`grain relative overflow-hidden ${className}`}
      style={{ aspectRatio: RATIO[ratio], background: field.bg }}
      role="img"
      aria-label={alt}
    >
      {/* soft directional sheen for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 12%, rgba(255,255,255,0.10), transparent 55%)",
        }}
        aria-hidden
      />
      {/* monogram watermark + hairline frame */}
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <div
          className="absolute inset-4 border"
          style={{ borderColor: field.fg, opacity: 0.18 }}
        />
        <span
          className="font-display"
          style={{
            color: field.fg,
            opacity: 0.3,
            fontSize: "clamp(1.8rem, 5vw, 4rem)",
            letterSpacing: "0.06em",
          }}
        >
          TX
        </span>
      </div>
    </div>
  );
}
