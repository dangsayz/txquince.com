import "@/components/txq/pages/pages.css";

/**
 * Route-level loading fallback. Next wraps the homepage in this boundary too,
 * and React streams a large page behind it: the prerendered HTML paints this
 * skeleton (and the footer after it) first, then swaps the real page in. The
 * skeleton therefore reserves a full viewport (.tq-pg-loading) so the footer
 * starts below the fold and never jumps out of view (CLS; Gate 3).
 */
export default function LoadingPage() {
  return (
    <div className="tq-wrap tq-pg-loading" role="status" aria-label="Loading page">
      <div className="tq-pg-mast" aria-hidden="true">
        <span className="tq-pg-skel tq-pg-skel-line" style={{ width: 160 }} />
        <div className="tq-pg-mast__body">
          <span className="tq-pg-skel" style={{ display: "block", height: 56, maxWidth: 480 }} />
          <span className="tq-pg-skel tq-pg-skel-line" style={{ maxWidth: 340 }} />
        </div>
      </div>
      <div className="tq-pg-plate tq-pg-skel" aria-hidden="true" />
      <span className="tq-sr">Loading content</span>
    </div>
  );
}
