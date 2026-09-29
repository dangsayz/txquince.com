import { getVideos } from "@/lib/content-db";
import { VideosManager } from "@/components/admin/VideosManager";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await getVideos();
  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 md:px-10 md:py-14 lg:px-16">
      <h1 className="font-display text-[clamp(1.75rem,2.8vw,2.25rem)] leading-tight text-ink">Videos</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">
        Paste a link from YouTube, Vimeo, a direct video file, or QuinceNetwork.
        YouTube/Vimeo play inline; other links show as an elegant poster that opens
        the film. Mark one as <em>Featured</em> to headline the films section.
      </p>
      <div className="mt-8">
        <VideosManager initial={videos} />
      </div>
    </div>
  );
}
