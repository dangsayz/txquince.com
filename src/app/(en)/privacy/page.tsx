import type { Metadata } from "next";
import { site } from "@/content/site";
import "@/components/txq/pages/pages.css";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What TX Quince collects through the inquiry form, why, and how it's used.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "collect",
    title: "What we collect",
    body: (
      <p>
        When you use the inquiry form, we collect the information you provide: your name and email (required), and
        optionally your phone number, event date, venue or city, the services you&apos;re interested in, a budget range,
        how you heard about us, and any message you write.
      </p>
    ),
  },
  {
    id: "why",
    title: "Why we collect it",
    body: (
      <p>
        We use this information for one purpose: to respond to your inquiry about photographing your daughter&apos;s
        quinceañera and to discuss your date, collection, and details. By submitting the form, you agree to be contacted
        about your event.
      </p>
    ),
  },
  {
    id: "storage",
    title: "How it's stored & shared",
    body: (
      <p>
        Your inquiry is stored securely in our own database and sent to us by email so we can reply. We do not sell your
        information, and we do not share it with third parties for marketing. We use trusted service providers (for
        hosting, database, email delivery, and spam protection) solely to operate this site.
      </p>
    ),
  },
  {
    id: "choices",
    title: "Your choices",
    body: (
      <p>
        You can ask us to access or delete the information you submitted at any time by emailing{" "}
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
      </p>
    ),
  },
  {
    id: "imagery",
    title: "Imagery",
    body: (
      <p>
        Every photograph and testimonial published on this site is shared only with signed parental consent and
        contractual permission to use it. If you are a past client and would like an image removed, contact us and we
        will take it down.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <article className="tq-wrap">
      <header className="tq-pg-mast">
        <p className="tq-pg-mast__index tq-mono">[TX Quince / Your information]</p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title">Privacy policy</h1>
          <p className="tq-mono tq-muted" style={{ margin: 0 }}>
            Last updated June 2026
          </p>
        </div>
      </header>
      <div style={{ borderTop: "1px solid var(--border-hairline)" }}>
        {SECTIONS.map((section, i) => (
          <section key={section.id} className="tq-pg-row" aria-labelledby={`privacy-${section.id}`}>
            <p className="tq-pg-row__index tq-mono">[{String(i + 1).padStart(2, "0")}]</p>
            <div className="tq-pg-row__body tq-pg-row__body--narrow">
              <h2 id={`privacy-${section.id}`} className="tq-display tq-pg-row__title" style={{ fontSize: "clamp(1.375rem, 1.1rem + 0.9vw, 2rem)" }}>
                {section.title}
              </h2>
              <div className="tq-pg-prose">{section.body}</div>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
