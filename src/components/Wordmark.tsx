export function Wordmark({
  subline = true,
  size = "nav",
}: {
  subline?: boolean;
  size?: "nav" | "masthead";
}) {
  return (
    <span className="inline-flex flex-col">
      <span className={`${size === "masthead" ? "text-2xl" : "text-[1.125rem] md:text-[1.25rem]"} font-semibold leading-none tracking-[-0.035em] text-ink`}>
        TX Quince
      </span>
      {subline && (
        <span className="mt-1 text-[0.625rem] font-medium leading-none tracking-[0.01em] text-ink-soft">
          Photography &amp; Film
        </span>
      )}
    </span>
  );
}
