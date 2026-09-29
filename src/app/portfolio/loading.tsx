export default function PortfolioLoading() {
  return (
    <section className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 lg:px-12" role="status" aria-label="Loading portfolio">
      <div className="h-10 w-64 animate-pulse rounded bg-greige" />
      <div className="mt-5 h-5 w-80 max-w-full animate-pulse rounded bg-greige" />
      <div className="mt-8 flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-10 w-24 animate-pulse rounded-full bg-greige" />)}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-xl bg-greige" />)}
      </div>
      <span className="sr-only">Loading galleries</span>
    </section>
  );
}
