import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { packages, isCollectionId } from "@/content/packages";
import { getPortfolioImages } from "@/lib/content-db";
import { BookingForm } from "@/components/BookingForm";
import { Testimonials } from "@/components/Testimonials";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Reserve Your Date",
  description:
    "Lock in your daughter's quinceañera date with a deposit. Secure Stripe checkout, applied to your final balance, refundable if I ever have to cancel.",
  alternates: { canonical: "/reserve" },
  openGraph: {
    title: "Reserve Your Date · TX Quince",
    description:
      "Lock in her quinceañera date with a deposit — secure checkout, applied to your final balance.",
    url: `${site.url}/reserve`,
  },
};

// What happens after they send the date — three quiet lines, the only context
// the page needs. Editorial index numerals, not CMS meta-labels.
const STEPS = [
  { n: "01", title: "Send the date", body: "I confirm it's open, usually within 24 hours." },
  { n: "02", title: "Lock it in", body: "A secure deposit link, applied to your balance." },
  { n: "03", title: "It's yours", body: "One celebration a day — no one else can claim it." },
];

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; collection?: string; date?: string }>;
}) {
  const { canceled, collection, date } = await searchParams;
  const defaultCollection = isCollectionId(collection) ? collection : undefined;
  const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  const signature = packages.find((p) => p.id === "signature") ?? packages[1];
  const floor = packages[0];

  // The page's focal point — a real DFW celebration beside the form. Prefer a
  // portrait frame for the tall column; fall back to the first image, then to a
  // warm editorial field if the gallery isn't populated yet.
  const images = await getPortfolioImages();
  const heroImg =
    images.find((i) => i.width && i.height && i.height > i.width) ??
    images[0] ??
    null;
  // Branded serve route (/api/img/{slug}) sized inline — the same pattern the
  // gallery + photo pages use. next/image is intentionally avoided here: its
  // custom loader rewrites to /img/{slug}, which 404s.
  const sized = (w: number) =>
    heroImg ? `${heroImg.url}${heroImg.url.includes("?") ? "&" : "?"}w=${w}` : "";

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-5 md:px-8">
      {/* Masthead — one tracked overline, an oversized serif line, one sentence. */}
      <header className="mx-auto max-w-3xl pt-section text-center md:pt-40">
        <p className="text-[0.66rem] font-medium uppercase tracking-[0.34em] text-wine">
          Reserve
        </p>
        <h1 className="display-1 mt-8 text-balance text-ink">
          Hold <span className="italic">her</span> date.
        </h1>
        <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-ink-soft md:text-[1.075rem]">
          Tell me the date. I&apos;ll confirm it&apos;s open within 24 hours and send a
          secure link to lock it in — no payment today.
        </p>
      </header>

      {/* Booking — the photo carries the emotion, the card carries the action. */}
      <section className="mt-14 md:mt-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-start lg:gap-14">
          {/* Left — the work, then the three quiet steps. */}
          <Reveal className="flex flex-col">
            <figure className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line bg-cream shadow-[0_34px_80px_-34px_rgba(28,26,23,0.32)]">
              {heroImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sized(1200)}
                  srcSet={`${sized(640)} 640w, ${sized(960)} 960w, ${sized(1200)} 1200w, ${sized(1600)} 1600w`}
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  alt={
                    heroImg.alt ||
                    "A quinceañera celebration in Dallas–Fort Worth, photographed by TX Quince"
                  }
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(80% 70% at 70% 20%, #fbf2ec 0%, #f3e7da 46%, #e9d7c6 100%)",
                  }}
                />
              )}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/5"
                style={{
                  background:
                    "linear-gradient(to top, rgba(20,16,14,0.66) 0%, rgba(20,16,14,0) 100%)",
                }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-xl leading-tight text-cream">
                  One day you cannot repeat.
                </p>
                <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream/85">
                  {site.proof.familiesLine} · rated {site.proof.rating}
                </p>
              </figcaption>
            </figure>

            <ul className="mt-8 space-y-5 border-t border-line pt-8">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="mt-0.5 font-display text-sm text-wine-deep">{s.n}</span>
                  <div>
                    <p className="font-display text-lg leading-tight text-ink">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Right — the form, lifted onto an ivory card so it reads as an object. */}
          <div>
            {canceled ? (
              <p
                role="status"
                className="mb-6 rounded-2xl border border-line bg-cream px-5 py-4 text-sm leading-relaxed text-ink-soft"
              >
                Your checkout was canceled and nothing was charged — your date isn&apos;t
                reserved yet. Pick it back up below whenever you&apos;re ready.
              </p>
            ) : null}

            <Reveal>
              <div className="rounded-[1.5rem] border border-line bg-ivory p-6 shadow-[0_34px_80px_-34px_rgba(28,26,23,0.24)] sm:p-8 md:p-10">
                <BookingForm defaultCollection={defaultCollection} defaultDate={defaultDate} />
              </div>
            </Reveal>

            <div className="mt-7 space-y-2.5 text-sm leading-relaxed text-ink-soft">
              <p>
                Collections are fixed-price from {floor.priceLabel}; most families choose{" "}
                {signature.name} at {signature.priceLabel}.{" "}
                <Link
                  href="/investment"
                  className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-wine"
                >
                  See what&apos;s included
                </Link>
              </p>
              <p>
                Not ready to commit?{" "}
                <Link
                  href={site.secondaryCta.href}
                  className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-wine"
                >
                  Send an inquiry first
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing — one editorial line to the real galleries, then proof if cleared. */}
      <Reveal className="mx-auto mt-section max-w-3xl border-t border-line pt-section text-center md:mt-section-lg md:pt-section-lg">
        <p className="text-[0.66rem] font-medium uppercase tracking-[0.34em] text-wine">
          Before you reserve
        </p>
        <p className="mx-auto mt-7 max-w-xl font-display text-2xl leading-snug text-ink md:text-[1.85rem]">
          See full quinceañeras, start to finish — real DFW galleries and films.
        </p>
        <Link
          href="/portfolio"
          className="mt-8 inline-block text-[0.72rem] uppercase tracking-[0.22em] text-ink underline decoration-wine/40 underline-offset-[6px] transition-colors hover:decoration-wine"
        >
          View the galleries
        </Link>
        <p className="mt-12 text-xs text-ink-soft">
          {site.proof.familiesLine} · rated {site.proof.rating} · {site.serviceArea}
        </p>
      </Reveal>

      <Testimonials className="pb-section md:pb-section-lg" />
    </div>
  );
}
