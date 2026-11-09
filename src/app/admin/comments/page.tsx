import { requireAdminPage } from "@/lib/require-admin";
import { listBlockedCommenters, listCommentsForAdmin, type BlockedCommenter } from "@/lib/comments-db";
import { commentPostPath } from "@/lib/comments";
import { getEsPost, getPost } from "@/content/blog";
import { StudioPage } from "@/components/admin/StudioPage";
import { CommentsManager, type AdminComment } from "@/components/admin/CommentsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comments · TX Quince Studio" };

export default async function AdminComments() {
  await requireAdminPage("/admin/comments");
  let loadError: string | null = null;
  let comments: AdminComment[] = [];
  let blocked: BlockedCommenter[] = [];
  try {
    comments = (await listCommentsForAdmin()).map((c) => ({
      ...c,
      postTitle: (c.lang === "es" ? getEsPost(c.post_slug) : getPost(c.post_slug))?.title ?? c.post_slug,
      postPath: commentPostPath(c),
    }));
    blocked = await listBlockedCommenters();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load comments.";
  }
  return (
    <StudioPage
      title="Comments"
      intro="Comments from the Journal. Nothing shows on the site until you approve it. Answer to reply as TX Quince."
      actions={<a href="/blog" target="_blank" rel="noopener noreferrer" className="st-btn-ghost">Open the Journal <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span></a>}
    >
      {loadError ? (
        <p role="alert" className="st-card px-5 py-4 text-[15px]">
          Comments could not load: {loadError}. If this is the first time, apply the D1 migration: <code>npx wrangler d1 migrations apply txquince --remote</code>.
        </p>
      ) : null}
      <CommentsManager initial={comments} blocked={blocked} />
    </StudioPage>
  );
}
