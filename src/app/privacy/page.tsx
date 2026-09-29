import type { Metadata } from "next";
import { site } from "@/content/site";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What TX Quince collects through the inquiry form, why, and how it's used.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="bg-ivory px-5 py-12 sm:px-6 md:py-20">
      <div className="mx-auto max-w-3xl rounded-xl border border-line bg-white p-7 sm:p-12">
        <Badge>Privacy</Badge>
        <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">Privacy policy</h1>
        <p className="mt-3 text-sm text-ink-faint">Last updated June 2026.</p>

        <div className="mt-10 divide-y divide-line border-t border-line text-base leading-7 text-ink-soft">
          <section className="py-7">
            <h2 className="text-lg font-semibold text-ink">What we collect</h2>
            <p className="mt-3">
              When you use the inquiry form, we collect the information you provide:
              your name and email (required), and optionally your phone number, event
              date, venue or city, the services you&apos;re interested in, a budget
              range, how you heard about us, and any message you write.
            </p>
          </section>

          <section className="py-7">
            <h2 className="text-lg font-semibold text-ink">Why we collect it</h2>
            <p className="mt-3">
              We use this information for one purpose: to respond to your inquiry about
              photographing your daughter&apos;s quinceañera and to discuss your date,
              collection, and details. By submitting the form, you agree to be
              contacted about your event.
            </p>
          </section>

          <section className="py-7">
            <h2 className="text-lg font-semibold text-ink">How it&apos;s stored & shared</h2>
            <p className="mt-3">
              Your inquiry is stored securely in our own database and sent to us by
              email so we can reply. We do not sell your information, and we do not
              share it with third parties for marketing. We use trusted service
              providers (for hosting, database, email delivery, and spam protection)
              solely to operate this site.
            </p>
          </section>

          <section className="py-7">
            <h2 className="text-lg font-semibold text-ink">Your choices</h2>
            <p className="mt-3">
              You can ask us to access or delete the information you submitted at any
              time by emailing{" "}
              <a
                href={`mailto:${site.contact.email}`}
                className="text-ink underline underline-offset-2"
              >
                {site.contact.email}
              </a>
              .
            </p>
          </section>

          <section className="py-7">
            <h2 className="text-lg font-semibold text-ink">Imagery</h2>
            <p className="mt-3">
              Every photograph and testimonial published on this site is shared only
              with signed parental consent and contractual permission to use it. If you
              are a past client and would like an image removed, contact us and we will
              take it down.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
