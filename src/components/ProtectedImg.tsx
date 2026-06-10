"use client";

/**
 * ProtectedImg — plain <img> with the deterrent layer: right-click and drag
 * disabled, long-press callout suppressed. The REAL protection is upstream
 * (/api/img serves capped, watermarked derivatives only); this just removes
 * the casual save path.
 */
export function ProtectedImg({
  src,
  alt,
  width,
  height,
  className = "",
  loading,
}: {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      {...(width && height ? { width, height } : {})}
      loading={loading}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={`select-none ${className}`}
      style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
    />
  );
}
