import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { packages, isCollectionId } from "@/content/packages";
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

  return (
    <div className="mx-auto max-w-3xl overflow-x-clip px-5 md:px-8">
      {/* Masthead — one tracked overline, an oversized serif line, one sentence. */}
      <header className="pt-section text-center md:pt-40">
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

      {/* The three steps — quiet trio, generous air, hairline above. */}
      <ul className="mt-20 grid gap-10 border-t border-line pt-12 sm:grid-cols-3 sm:gap-8 md:mt-28">
        {STEPS.map((s) => (
          <li key={s.n}>
            <span className="font-display text-sm text-wine">{s.n}</span>
            <p className="mt-3 font-display text-xl leading-tight text-ink">{s.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </li>
        ))}
      </ul>

      {canceled ? (
        <p
          role="status"
          className="mx-auto mt-20 max-w-lg border-t border-line pt-6 text-center text-sm text-ink-soft md:mt-28"
        >
          Your checkout was canceled and nothing was charged — your date isn&apos;t
          reserved yet. Pick it back up below whenever you&apos;re ready.
        </p>
      ) : null}

      {/* The form — alone, centered, the whole focus of the page. */}
      <div className="mx-auto mt-24 max-w-xl md:mt-36">
        <BookingForm defaultCollection={defaultCollection} defaultDate={defaultDate} />
      </div>

      {/* Reassurance — two whisper-quiet centered lines, no boxes. */}
      <div className="mx-auto mt-16 max-w-lg space-y-3 text-center text-sm leading-relaxed text-ink-soft">
        <p>
          Collections are fixed-price from {floor.priceLabel}; most families choose{" "}
          {signature.name} at {signature.priceLabel}.{" "}
          <Link
            href="/investment"
            className="text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:decoration-wine"
          >
            See what&apos;s included
          </Link>
        </p>
        <p>
          Not ready to commit?{" "}
          <Link
            href={site.secondaryCta.href}
            className="text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:decoration-wine"
          >
            Send an inquiry first
          </Link>
          .
        </p>
      </div>

      {/* Closing — one editorial line to the real galleries, then proof if cleared. */}
      <Reveal className="mt-section border-t border-line pt-section text-center md:mt-section-lg md:pt-section-lg">
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
