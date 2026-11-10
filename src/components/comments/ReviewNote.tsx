/**
 * The approval rule, shown at the foot of every comment box: a family should
 * know before they write that our team reads each comment first.
 */
export function ReviewNote({ id, text }: { id?: string; text: string }) {
  return (
    <p id={id} className="tq-cmt__review">
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 2.5 3.75 5v4.6c0 3.7 2.6 6.6 6.25 7.9 3.65-1.3 6.25-4.2 6.25-7.9V5L10 2.5Z" />
        <path d="m7.4 10.1 1.9 1.9 3.4-3.7" />
      </svg>
      <span>{text}</span>
    </p>
  );
}
