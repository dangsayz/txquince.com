"use client";

import { useState } from "react";
import Link from "next/link";

export type VenueRow = {
  slug: string;
  name: string;
  venueFull: string;
  city: string;
  citySlug: string | null;
  section: string;
  count: number;
};

type Faq = { q: string; a: string };
type Copy = {
  about: string | null;
  faq: Faq[];
  address: string | null;
  area: string | null;
  ig_handle: string | null;
  website: string | null;
};

const field =
  "w-full border-b border-line bg-transparent pb-1 text-sm focus:border-wine focus:outline-none";

function VenueCard({ venue, initial }: { venue: VenueRow; initial: Copy }) {
  const [about, setAbout] = useState(initial.about ?? "");
  const [faq, setFaq] = useState<Faq[]>(initial.faq.length ? initial.faq : []);
  const [address, setAddress] = useState(initial.address ?? "");
  const [area, setArea] = useState(initial.area ?? "");
  const [ig, setIg] = useState(initial.ig_handle ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/admin/venues", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: venue.slug,
          about: about.trim() || null,
          faq: faq.filter((f) => f.q.trim() || f.a.trim()),
          address: address.trim() || null,
          area: area.trim() || null,
          ig_handle: ig.trim() || null,
          website: website.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus(res.ok ? "Saved." : data.error || "Could not save.");
    } catch {
      setStatus("Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function aiDraft() {
    setBusy(true);
    setStatus("Writing copy with AI…");
    try {
      const res = await fetch("/api/admin/venue-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: venue.slug }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        about?: string;
        faq?: Faq[];
        error?: string;
      };
      if (res.ok && (data.about || data.faq)) {
        if (data.about) setAbout(data.about);
        if (data.faq?.length) setFaq(data.faq);
        setStatus("Drafted — review, edit, then Save.");
      } else {
        setStatus(data.error || "Could not generate copy.");
      }
    } catch {
      setStatus("Could not generate copy.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <div>
          <h2 className="font-display text-xl text-ink">{venue.name}</h2>
          <p className="mt-0.5 text-xs text-ink-faint">
            {venue.city}, TX · {venue.count} photo{venue.count === 1 ? "" : "s"}
            {venue.count === 0 ? " · drop a shoot in media-inbox to populate" : ""}
          </p>
        </div>
        <Link
          href={`/venues/${venue.slug}`}
          target="_blank"
          className="text-[0.66rem] uppercase tracking-[0.14em] text-wine underline-offset-4 hover:underline"
        >
          View page ↗
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <label className="block">
          <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">
            About (intro paragraph + meta description)
          </span>
          <textarea
            value={about}
            rows={3}
            onChange={(e) => setAbout(e.target.value)}
            placeholder={`Why ${venue.name} is a beautiful place for a quinceañera…`}
            className={`${field} mt-1 resize-none leading-snug`}
          />
        </label>

        {/* FAQ editor */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">
              FAQ (shows on page + FAQ rich-result schema)
            </span>
            <button
              type="button"
              onClick={() => setFaq((f) => [...f, { q: "", a: "" }])}
              className="text-[0.66rem] uppercase tracking-[0.14em] text-wine hover:underline"
            >
              + Add Q&amp;A
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-3">
            {faq.length === 0 ? (
              <p className="text-xs text-ink-faint">No FAQ yet — add one or use AI below.</p>
            ) : (
              faq.map((f, i) => (
                <div key={i} className="rounded-lg border border-line/70 p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        value={f.q}
                        placeholder="Question"
                        onChange={(e) =>
                          setFaq((prev) => prev.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))
                        }
                        className={field}
                      />
                      <textarea
                        value={f.a}
                        rows={2}
                        placeholder="Answer"
                        onChange={(e) =>
                          setFaq((prev) => prev.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))
                        }
                        className={`${field} mt-2 resize-none leading-snug`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFaq((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove question"
                      className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-wine hover:text-cream"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Facts */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, TX" className={`${field} mt-1`} />
          </label>
          <label className="block">
            <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">Area / neighborhood</span>
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Las Colinas" className={`${field} mt-1`} />
          </label>
          <label className="block">
            <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">Venue Instagram</span>
            <input value={ig} onChange={(e) => setIg(e.target.value)} placeholder="@venuehandle" className={`${field} mt-1`} />
          </label>
          <label className="block">
            <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">Venue website</span>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="venue.com" className={`${field} mt-1`} />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="min-h-[44px] rounded-full bg-wine px-6 text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={aiDraft}
            disabled={busy}
            className="min-h-[44px] rounded-full border border-wine/40 px-5 text-[0.7rem] uppercase tracking-[0.16em] text-wine transition-colors hover:border-wine hover:bg-wine hover:text-cream disabled:opacity-50"
            title="Draft the about paragraph + FAQ with AI (you edit, then Save)"
          >
            AI: write venue copy
          </button>
          {status ? <span className="text-xs text-ink-faint">{status}</span> : null}
        </div>
      </div>
    </section>
  );
}

export function VenueManager({
  venues,
  copy,
}: {
  venues: VenueRow[];
  copy: Record<string, Copy>;
}) {
  const empty: Copy = { about: null, faq: [], address: null, area: null, ig_handle: null, website: null };
  return (
    <div className="flex flex-col gap-6">
      {venues.map((v) => (
        <VenueCard key={v.slug} venue={v} initial={copy[v.slug] ?? empty} />
      ))}
    </div>
  );
}
