import { getVideos } from "@/lib/content-db";
import { VideosManager } from "@/components/admin/VideosManager";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await getVideos();
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink">Videos</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Paste a link from YouTube, Vimeo, a direct video file, or QuinceNetwork.
        YouTube/Vimeo play inline; other links show as an elegant poster that opens
        the film. Mark one as <em>Featured</em> to headline the films section.
      </p>
      <div className="mt-8">
        <VideosManager initial={videos} />
      </div>
    </main>
  );
}
