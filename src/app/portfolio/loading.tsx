export default function PortfolioLoading() {
  return (
    <div role="status" aria-label="Loading portfolio" className="bg-cream">
      <div className="mx-auto grid max-w-[100rem] lg:min-h-[min(48rem,80svh)] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="order-2 flex flex-col justify-center gap-5 px-5 py-16 md:px-10 lg:order-1 lg:px-16" aria-hidden="true">
          <div className="h-3 w-28 animate-pulse bg-greige motion-reduce:animate-none" />
          <div className="mt-8 h-12 w-4/5 animate-pulse bg-greige motion-reduce:animate-none" />
          <div className="h-5 w-3/4 animate-pulse bg-greige motion-reduce:animate-none" />
          <div className="h-5 w-2/3 animate-pulse bg-greige motion-reduce:animate-none" />
        </div>
        <div className="order-1 aspect-[4/5] animate-pulse bg-greige motion-reduce:animate-none sm:aspect-[5/4] lg:order-2 lg:aspect-auto" aria-hidden="true" />
      </div>
      <span className="sr-only">Loading photographs</span>
    </div>
  );
}
