import "@/components/txq/pages/pages.css";

export default function LoadingPage() {
  return (
    <div className="tq-wrap" role="status" aria-label="Loading page">
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
