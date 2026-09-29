export default function LoadingPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-5 py-12 sm:px-8 lg:px-12" role="status" aria-label="Loading page">
      <div className="h-4 w-32 animate-pulse rounded bg-greige" />
      <div className="mt-5 h-12 max-w-lg animate-pulse rounded bg-greige" />
      <div className="mt-4 h-5 max-w-sm animate-pulse rounded bg-greige" />
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-xl bg-greige" />)}
      </div>
      <span className="sr-only">Loading content</span>
    </div>
  );
}
