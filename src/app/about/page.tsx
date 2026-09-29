import type { Metadata } from "next";
import Link from "next/link";
import { about } from "@/content/about";
import { site } from "@/content/site";
import { Figure } from "@/components/Figure";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge, ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "See how TX Quince approaches quinceañera photography and film across Dallas–Fort Worth.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · TX Quince",
    description:
      "Explore TX Quince photography and film, and share the details of your quinceañera.",
    url: `${site.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-ivory">
        <div className="mx-auto grid max-w-[96rem] gap-10 px-5 py-12 sm:px-6 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)] md:items-center md:gap-14 md:py-20 lg:px-8">
          <div>
            <Badge>About the studio</Badge>
            <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,4vw,4rem)] leading-[1.12] text-ink">
              About <span className="text-accent">TX Quince.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-ink-soft">
              Quinceañera photography and film built around clear communication, careful preparation, and being present for every part of the day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={site.secondaryCta.href}>Tell us your date</ButtonLink>
              <ButtonLink href="/portfolio" tone="secondary">Explore the portfolio</ButtonLink>
            </div>
          </div>
          {about.portraitKey ? (
            <Figure imageKey={about.portraitKey} alt={about.portraitAlt} ratio="portrait" sizes="(max-width: 768px) 100vw, 40vw" className="rounded-xl" />
          ) : (
            <div className="flex min-h-[320px] flex-col justify-between rounded-xl border border-line bg-white p-7 sm:p-9 md:min-h-[420px]">
              <span className="font-display text-3xl text-ink"><span className="text-accent">TX</span> Quince</span>
              <div>
                <p className="text-xs font-semibold text-accent-strong">Photography &amp; film</p>
                <p className="mt-4 max-w-xs font-display text-3xl leading-tight text-ink">Quinceañera coverage built around your family.</p>
                <p className="mt-5 text-sm text-ink-soft">{site.serviceArea}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-[96rem] gap-10 px-5 py-16 sm:px-6 md:grid-cols-[minmax(180px,.35fr)_minmax(0,1fr)] md:gap-16 md:py-24 lg:px-8">
        <div>
          <p className="text-xs font-semibold text-accent-strong">Our approach</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl">How TX Quince works.</h2>
        </div>
        <div className="max-w-3xl space-y-6 text-base leading-8 text-ink-soft">
          {about.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="border-y border-line bg-ivory">
        <div className="mx-auto grid max-w-[96rem] gap-5 px-5 py-16 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
          {[
            { ...about.culture, heading: "Your traditions" },
            { ...about.approach, heading: "Explore the work" },
          ].map((item) => (
            <article key={item.heading} className="rounded-xl border border-line bg-white p-7 sm:p-9">
              <span aria-hidden="true" className="mb-8 block h-1 w-12 rounded-full bg-accent" />
              <h2 className="font-display text-2xl leading-tight text-ink md:text-3xl">{item.heading}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-[96rem] flex-col gap-6 px-5 py-16 sm:px-6 md:flex-row md:items-end md:justify-between md:py-24 lg:px-8">
        <p className="max-w-3xl font-display text-3xl leading-tight text-ink md:text-4xl">Planning a quinceañera in Dallas–Fort Worth? Tell us your date and the coverage you need.</p>
        <Link href={site.secondaryCta.href} className="shrink-0 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-strong">Check your date ↗</Link>
      </section>

      <FinalCTA accent="Planning your quinceañera" headline="Let's talk about your celebration." sub="Share your date and what you have in mind. We'll follow up personally." />
    </>
  );
}
