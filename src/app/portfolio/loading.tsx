export default function PortfolioLoading() {
  return (
    <div role="status" aria-label="Loading portfolio" className="bg-white px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
      <div className="mx-auto max-w-[92rem] bg-cream px-6 py-12 md:py-28" aria-hidden="true">
        <div className="mx-auto h-3 w-36 animate-pulse bg-greige motion-reduce:animate-none" />
        <div className="mx-auto mt-6 h-14 w-56 animate-pulse bg-greige motion-reduce:animate-none" />
        <div className="mx-auto mt-7 h-4 w-full max-w-md animate-pulse bg-greige motion-reduce:animate-none" />
        <div className="mx-auto mt-3 h-4 w-3/4 max-w-sm animate-pulse bg-greige motion-reduce:animate-none" />
      </div>
      <div className="mx-auto grid max-w-[92rem] gap-3 pb-24 pt-12 sm:grid-cols-2 md:pt-20" aria-hidden="true">
        <div className="aspect-[4/5] animate-pulse bg-greige motion-reduce:animate-none" />
        <div className="aspect-[4/5] animate-pulse bg-greige motion-reduce:animate-none" />
      </div>
      <span className="sr-only">Loading photographs</span>
    </div>
  );
}
