import Image from "next/image";
import { mediaUrl } from "@/content/media";

type Ratio = "portrait" | "landscape" | "square";

const RATIO: Record<Ratio, string> = {
  portrait: "3 / 4",
  landscape: "3 / 2",
  square: "1 / 1",
};

/**
 * Figure — renders a release-cleared R2 image, or a tasteful, clearly-labeled
 * placeholder when no media is configured yet (LAW 5: placeholders never pretend
 * to be a real photo). ALT TEXT is required (accessibility + image SEO).
 */
export function Figure({
  imageKey,
  alt,
  ratio = "portrait",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className = "",
}: {
  imageKey?: string;
  alt: string;
  ratio?: Ratio;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const url = mediaUrl(imageKey);

  return (
    <div
      className={`relative overflow-hidden bg-greige ${className}`}
      style={{ aspectRatio: RATIO[ratio] }}
    >
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <Placeholder alt={alt} />
      )}
    </div>
  );
}

/** Editorial placeholder: a subtle frame + monogram + the alt as a quiet hint. */
function Placeholder({ alt }: { alt: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="absolute inset-3 border border-line/70" aria-hidden />
      <span
        className="font-display text-3xl text-ink/25"
        aria-hidden
        style={{ letterSpacing: "0.04em" }}
      >
        TX
      </span>
      <span className="eyebrow text-ink-faint/80">Release-cleared photo</span>
      <span className="max-w-[22ch] text-[11px] leading-relaxed text-ink-faint/70">
        {alt}
      </span>
    </div>
  );
}
