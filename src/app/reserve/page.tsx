import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { packages, isCollectionId } from "@/content/packages";
import { BookingForm } from "@/components/BookingForm";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { HowBookingWorks } from "@/components/HowBookingWorks";
import { Testimonials } from "@/components/Testimonials";
import { CTAButton } from "@/components/CTAButton";

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

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; collection?: string }>;
}) {
  const { canceled, collection } = await searchParams;
  const defaultCollection = isCollectionId(collection) ? collection : undefined;
  const signature = packages.find((p) => p.id === "signature") ?? packages[1];
  const floor = packages[0];

  return (
    <>
      {/* Trust bar — proof before the ask (56% want proof before committing). */}
      <div className="border-b border-line bg-ivory">
        <div className="mx-auto max-w-6xl px-5 py-5 md:px-8">
          <SocialProofStrip />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-section md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-section-lg">
        {/* Left: framing + what the deposit does */}
        <div className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow mb-5">Reserve</p>
          <h1 className="display-2 text-ink text-balance">
            Lock in her date today.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
            Tell me your date and collection and I&apos;ll hold it for you. I
            personally confirm it&apos;s open and send a secure deposit link to
            lock it in — usually within 24 hours. <span className="text-ink">No
            payment right now.</span>
          </p>

          <div className="mt-8 border-l-2 border-wine pl-5">
            <p className="text-sm leading-relaxed text-ink-soft">
              {site.booking.policyNote} I only take one celebration per day, so once
              your date is reserved it&apos;s yours alone.
            </p>
          </div>

          <ul className="mt-8 flex flex-col gap-3 text-sm text-ink-soft">
            {[
              "Send your date — I confirm it's open within 24 hours.",
              "Then I send a secure deposit link to lock it in.",
              "The deposit applies to your final balance. Pay in full or split it interest-free.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-wine" />
                {line}
              </li>
            ))}
          </ul>

          {/* Pricing reassurance — defuse "what does this cost?" at the moment
              of decision. Real, fixed pricing; link to the full breakdown. */}
          <div className="mt-8 border border-line bg-greige p-5">
            <p className="text-sm leading-relaxed text-ink">
              <strong className="text-ink">Wondering about the full cost?</strong>{" "}
              Collections are fixed-price from {floor.priceLabel}; most families
              choose {signature.name} at {signature.priceLabel} — two storytellers,
              the whole day, film and gallery both.
            </p>
            <Link
              href="/investment"
              className="mt-3 inline-block text-sm text-wine underline underline-offset-2 hover:text-wine-deep"
            >
              See what&apos;s included in each collection →
            </Link>
          </div>

          <p className="mt-8 text-sm text-ink-faint">
            Not ready to commit?{" "}
            <Link
              href={site.secondaryCta.href}
              className="text-ink underline underline-offset-2 hover:text-wine"
            >
              Send an inquiry first
            </Link>{" "}
            and I&apos;ll personally confirm your date.
          </p>
        </div>

        {/* Right: the booking form */}
        <div>
          {canceled ? (
            <p
              role="status"
              className="mb-8 border border-line bg-ivory px-5 py-4 text-sm text-ink-soft"
            >
              No worries — your checkout was canceled and nothing was charged. Your
              date isn&apos;t reserved yet. Finish below whenever you&apos;re ready.
            </p>
          ) : null}
          <BookingForm defaultCollection={defaultCollection} />
        </div>
      </div>

      {/* How booking works — remove "what happens next?" uncertainty. */}
      <section className="bg-greige">
        <div className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
          <HowBookingWorks />
        </div>
      </section>

      {/* See the real, full work — defuse the scam/"is this real?" fear. */}
      <section className="mx-auto max-w-3xl px-5 py-section text-center md:px-8 md:py-section-lg">
        <p className="eyebrow mb-5">Before you reserve</p>
        <h2 className="display-2 text-ink text-balance">
          See full quinceañeras, start to finish.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
          Not a highlight reel — complete galleries and films from real DFW
          celebrations, so you know exactly what you&apos;re reserving.
        </p>
        <div className="mt-9 flex justify-center">
          <CTAButton href="/portfolio" variant="ink">
            View the galleries
          </CTAButton>
        </div>
      </section>

      {/* Testimonials — renders only when release-cleared ones exist. */}
      <Testimonials className="mx-auto max-w-7xl px-5 pb-section md:px-8 md:pb-section-lg" />
    </>
  );
}
