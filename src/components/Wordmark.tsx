export function Wordmark({
  subline = true,
  size = "nav",
  tone = "light",
}: {
  subline?: boolean;
  size?: "nav" | "masthead";
  tone?: "light" | "dark";
}) {
  return (
    <span className="inline-flex flex-col">
      <span className={`${size === "masthead" ? "text-3xl md:text-4xl" : "text-[1.25rem] md:text-[1.4rem]"} font-medium leading-none tracking-[-0.035em] ${tone === "dark" ? "text-white" : "text-ink"}`}>
        TX Quince
      </span>
      {subline && (
        <span className={`mt-1.5 text-[0.625rem] font-medium leading-none tracking-[0.01em] ${tone === "dark" ? "text-white/70" : "text-ink-soft"}`}>
          Photography &amp; Film
        </span>
      )}
    </span>
  );
}
