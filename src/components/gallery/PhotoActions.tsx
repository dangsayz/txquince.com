"use client";

import { useState } from "react";
import Link from "next/link";
import { FavoriteButton } from "@/components/gallery/Favorites";
import { ShareModal } from "@/components/ShareModal";
import "@/components/txq/pages/pages.css";

export function PhotoActions({ section, slug, title, pageUrl, bookingHref, image }: {
  section: string;
  slug: string;
  title: string;
  pageUrl: string;
  bookingHref: string;
  /** The photo (src + alt) so Share can offer "Save to Pinterest". */
  image?: { src: string; alt: string };
}) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="tq-pg-actions" role="group" aria-label="Photo actions">
        <Link href={bookingHref} className="tq-btn tq-btn--lg">
          Ask about your date <span className="tq-arrow" aria-hidden>→</span>
        </Link>
        <FavoriteButton section={section} slug={slug} />
        <button type="button" onClick={() => setShareOpen(true)} className="tq-btn tq-btn--ghost">
          Share
        </button>
      </div>
      <ShareModal open={shareOpen} url={pageUrl} title={`${title} · TX Quince`} image={image} onClose={() => setShareOpen(false)} />
    </>
  );
}
