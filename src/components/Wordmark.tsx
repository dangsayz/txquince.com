export function Wordmark({
  subline = true,
  size = "nav",
}: {
  subline?: boolean;
  size?: "nav" | "masthead";
}) {
  return (
    <span className="inline-flex flex-col whitespace-nowrap">
      <span className={`${size === "masthead" ? "text-[clamp(2.5rem,4vw,3.75rem)]" : "text-[1.25rem] md:text-[1.4rem]"} font-serif font-normal leading-none tracking-[-0.055em] text-[#252522]`}>
        TX Quince
      </span>
      {subline && (
        <span className="mt-1.5 text-[0.625rem] font-medium uppercase leading-none tracking-[0.13em] text-[#62625c]">
          Photography &amp; Film
        </span>
      )}
    </span>
  );
}
