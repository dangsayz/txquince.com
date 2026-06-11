/**
 * Page transition. template.tsx remounts on every navigation (unlike layout),
 * so the .page-enter animation replays — content fades + rises on each route
 * change. Pure CSS, zero JS, respects prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
