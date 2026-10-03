export function Wordmark({
  subline = true,
  size = "nav",
}: {
  subline?: boolean;
  size?: "nav" | "masthead";
}) {
  return (
    <span className="inline-flex flex-col whitespace-nowrap">
      <span className={`${size === "masthead" ? "text-[clamp(2rem,4vw,3.25rem)]" : "text-[1rem] md:text-[1.15rem]"} font-display font-light uppercase leading-none tracking-[0.12em]`}>
        TX Quince
      </span>
      {subline && (
        <span className="mt-2 text-[0.625rem] font-normal uppercase leading-none tracking-[0.15em] opacity-70">
          Photography &amp; Film
        </span>
      )}
    </span>
  );
}
