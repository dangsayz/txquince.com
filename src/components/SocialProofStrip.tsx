import { site } from "@/content/site";
import { Stars } from "@/components/Stars";
import "@/components/txq/pages/pages.css";

/**
 * Honest aggregate social proof (LAW 5: aggregate only — no individual minor
 * quotes here). Families served + average rating + service area, set as a mono
 * ledger split by hairlines. Values live in site.proof.
 */
export function SocialProofStrip({ className = "" }: { className?: string }) {
  return (
    <ul className={`tq-pg-proof tq-mono ${className}`}>
      <li>{site.proof.familiesLine}</li>
      <li>
        <Stars />
        <span className="tq-muted">{site.proof.rating} average</span>
      </li>
      <li className="tq-muted">{site.serviceArea}</li>
      <li className="tq-muted">{site.proof.insuredLine}</li>
    </ul>
  );
}
