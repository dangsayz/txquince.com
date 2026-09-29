export function Wordmark({ subline = true }: { subline?: boolean }) {
  return (
    <span className="inline-flex flex-col">
      <span className="text-[1.25rem] font-semibold leading-none tracking-[-0.035em] text-ink md:text-[1.4rem]">
        TX Quince
      </span>
      {subline && (
        <span className="mt-1.5 text-[0.625rem] font-semibold leading-none tracking-[0.01em] text-ink-soft">
          Photography &amp; Film
        </span>
      )}
    </span>
  );
}
