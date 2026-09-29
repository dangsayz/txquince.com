"use client";

import { useState } from "react";
import Link from "next/link";
import { FavoriteButton } from "@/components/gallery/Favorites";
import { ShareModal } from "@/components/ShareModal";

export function PhotoActions({ section, slug, title, pageUrl, bookingHref }: {
  section: string;
  slug: string;
  title: string;
  pageUrl: string;
  bookingHref: string;
}) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2" aria-label="Photo actions">
        <FavoriteButton section={section} slug={slug} />
        <button type="button" onClick={() => setShareOpen(true)} className="min-h-11 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Share</button>
        <Link href={bookingHref} className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Ask about your date ↗</Link>
      </div>
      <ShareModal open={shareOpen} url={pageUrl} title={`${title} · TX Quince`} onClose={() => setShareOpen(false)} />
    </>
  );
}
