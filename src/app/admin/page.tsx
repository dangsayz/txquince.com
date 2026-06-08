import Link from "next/link";
import { getPortfolioImages, getVideos } from "@/lib/content-db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [images, videos] = await Promise.all([getPortfolioImages(), getVideos()]);

  const cards = [
    {
      href: "/admin/portfolio",
      title: "Portfolio",
      count: `${images.length} image${images.length === 1 ? "" : "s"}`,
      desc: "Upload, organize by section, set featured, and reorder your photos.",
    },
    {
      href: "/admin/videos",
      title: "Videos",
      count: `${videos.length} video${videos.length === 1 ? "" : "s"}`,
      desc: "Paste links from YouTube or QuinceNetwork. They display as an editorial reel.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink">Studio</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Manage what shows on your public site. Changes go live within a minute.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group border border-line bg-ivory p-8 transition-colors hover:border-wine"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl text-ink">{c.title}</h2>
              <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">
                {c.count}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.desc}</p>
            <span className="mt-6 inline-block text-[0.72rem] uppercase tracking-[0.18em] text-wine">
              Manage →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
