/**
 * Briefing — the panel's opening status read: a few plain lines computed from
 * the live numbers by pulse-intel's briefing(). Static on purpose: no typing
 * effect and no ticking clock, so it reads at a glance and never re-renders.
 */
export function Briefing({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <div className="hud-card px-5 py-4 sm:px-6">
      <h3 className="hud-label m-0">In short</h3>
      <ul className="m-0 mt-2 grid list-none gap-1.5 p-0 text-[15px] leading-6 text-[#111110]">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2.5">
            <span aria-hidden className="mt-[11px] h-px w-3 shrink-0 bg-[#8c877f]" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
