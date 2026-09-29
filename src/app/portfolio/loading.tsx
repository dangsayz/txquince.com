export default function PortfolioLoading() {
  return (
    <section className="mx-auto max-w-[90rem] px-5 py-10 md:px-10 md:py-14 lg:px-16" role="status" aria-label="Loading portfolio">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-10">
        <div className="hidden space-y-3 lg:block" aria-hidden="true">
          <div className="h-4 w-28 animate-pulse rounded bg-greige motion-reduce:animate-none" />
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-11 w-full animate-pulse rounded-lg bg-greige motion-reduce:animate-none" />)}
        </div>
        <div>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]" aria-hidden="true">
            <div className="h-12 animate-pulse rounded-lg bg-greige motion-reduce:animate-none" />
            <div className="h-12 animate-pulse rounded-lg bg-greige motion-reduce:animate-none" />
          </div>
          <div className="mt-5 flex gap-2 overflow-hidden lg:hidden" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-11 w-28 shrink-0 animate-pulse rounded-lg bg-greige motion-reduce:animate-none" />)}
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-greige motion-reduce:animate-none" />)}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading photographs</span>
    </section>
  );
}
