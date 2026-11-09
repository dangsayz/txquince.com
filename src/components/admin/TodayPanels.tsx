import Link from "next/link";
import { ArrowIcon } from "@/components/admin/StudioIcons";
import { agoLabel, daysAgo, type PostPulse } from "@/lib/blog-pulse";
import type { BlogPulseData } from "@/lib/blog-pulse-db";
import { fmtSeconds } from "@/lib/page-behavior";
import type { ReviewRecord } from "@/lib/review";
import type { OpenTicket } from "@/lib/support-db";

/**
 * Three glance panels on the studio home (components/admin/TodayView.tsx):
 *   SupportPanel  open messages from families, the longest wait first
 *   ReviewsPanel  reviews and updates from moms that wait for a decision
 *   BlogPanel     reads, read time and comments, and the posts doing best
 * Each row opens the page where the work is done; nothing is edited here.
 * Refs (Mobbin): Ploy "Overview" (four numbers over ranked lists with bars),
 * Searchable "outstanding issues" (count first, then a short list), Shopify
 * Home (task counts that open the work).
 */
const num = (n: number) => n.toLocaleString("en-US");
const plural = (n: number, one: string, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;
const pct = (x: number) => `${Math.round(x * 100)}%`;
const TOPIC: Record<string, string> = { booking: "Booking or date", payment: "Payment", contract: "Agreement", other: "Other" };
const SHOWN = 4;

function PanelHead({ id, title, count, href, link }: { id: string; title: string; count: number; href: string; link: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pb-3 pt-5 sm:px-6">
      <h2 id={id} className="st-h2">
        {title} {count > 0 && <span className="st-num text-[var(--tq-ink-mute)]">{count}</span>}
      </h2>
      <Link href={href} className="st-link">
        {link} <ArrowIcon />
      </Link>
    </div>
  );
}

function Empty({ title, note }: { title: string; note: string }) {
  return (
    <div className="border-t border-[var(--tq-surface-2)] px-5 py-8 sm:px-6">
      <p className="m-0 text-[17px] font-medium">{title}</p>
      <p className="m-0 mt-1 text-[15px] text-[var(--tq-ink-mute)]">{note}</p>
    </div>
  );
}

/** One row: who, a chip, when, and the first line of what they wrote. */
function GlanceRow({ href, name, chip, tone, when, late, children }: { href: string; name: string; chip: string; tone?: "urgent" | "good"; when: string; late?: boolean; children: React.ReactNode }) {
  return (
    <li className="border-t border-[var(--tq-surface-2)]">
      <Link
        href={href}
        className="group block min-h-16 px-5 py-3 transition-colors duration-[var(--tq-dur-fast)] hover:bg-[var(--tq-canvas)] focus-visible:-outline-offset-2 sm:px-6"
      >
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="min-w-0 truncate text-[15px] font-semibold group-hover:underline group-hover:underline-offset-4">{name}</span>
          <span className="st-chip" data-tone={tone}>{chip}</span>
          <span className={`ml-auto whitespace-nowrap text-sm ${late ? "font-medium text-[var(--tq-status-down)]" : "text-[var(--tq-ink-mute)]"}`}>{when}</span>
        </span>
        <span className="mt-1 block truncate text-[15px] text-[var(--tq-ink-mute)]">{children}</span>
      </Link>
    </li>
  );
}

function More({ href, n, word }: { href: string; n: number; word: [string, string] }) {
  if (n <= 0) return null;
  return (
    <div className="border-t border-[var(--tq-surface-2)] px-5 py-1 sm:px-6">
      <Link href={href} className="st-link">
        {plural(n, word[0], word[1])} <ArrowIcon />
      </Link>
    </div>
  );
}

export function SupportPanel({ tickets, now }: { tickets: OpenTicket[]; now: Date }) {
  return (
    <section aria-labelledby="support-title" className="st-card">
      <PanelHead id="support-title" title="Support" count={tickets.length} href="/admin/support" link="All messages" />
      {tickets.length === 0 ? (
        <Empty title="No one is waiting." note="Messages families send from their account page show up here." />
      ) : (
        <ul className="m-0 list-none p-0">
          {tickets.slice(0, SHOWN).map((t) => {
            const waited = daysAgo(t.created_at, now);
            return (
              <GlanceRow key={t.id} href="/admin/support" name={t.name} chip={TOPIC[t.topic] ?? t.topic} when={agoLabel(waited)} late={waited >= 2}>
                {t.message}
              </GlanceRow>
            );
          })}
        </ul>
      )}
      <More href="/admin/support" n={tickets.length - SHOWN} word={["more message", "more messages"]} />
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} of 5 stars`} className="shrink-0 whitespace-nowrap text-[15px] tracking-[0.08em] text-[var(--tq-ink)]">
      {"★".repeat(rating)}
      <span aria-hidden="true" className="text-[var(--tq-ink-mute)]">{"☆".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewsPanel({ waiting, live, unused, now }: { waiting: ReviewRecord[]; live: number; unused: number; now: Date }) {
  const facts = [live ? `${num(live)} on the site` : "", unused ? `${plural(unused, "link")} not used yet` : ""].filter(Boolean).join(" · ");
  return (
    <section aria-labelledby="reviews-title" className="st-card">
      <PanelHead id="reviews-title" title="Reviews" count={waiting.length} href="/admin/reviews" link="All reviews" />
      {waiting.length === 0 ? (
        <Empty title="Nothing to approve." note="When a mom sends her review, you approve, hide or edit it here first." />
      ) : (
        <ul className="m-0 list-none p-0">
          {waiting.slice(0, SHOWN).map((r) => {
            const v = r.edit ?? r;
            const sent = v.submitted_at ?? r.created_at;
            return (
              <GlanceRow
                key={r.id}
                href="/admin/reviews"
                name={v.display_name || r.invite_name}
                chip={r.edit ? "Update to approve" : "New review"}
                tone={r.edit ? undefined : "good"}
                when={agoLabel(daysAgo(sent, now))}
              >
                {v.rating ? <Stars rating={v.rating} /> : null} {v.body}
              </GlanceRow>
            );
          })}
        </ul>
      )}
      <More href="/admin/reviews" n={waiting.length - SHOWN} word={["more review", "more reviews"]} />
      {facts ? <p className="st-note border-t border-[var(--tq-surface-2)] px-5 py-3 sm:px-6">{facts}</p> : null}
    </section>
  );
}

function Finished({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[var(--tq-ink-mute)]">—</span>;
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden="true" className="vb-track">
        <span style={{ width: pct(value) }} />
      </span>
      <span className="st-num w-10 text-right">{pct(value)}</span>
    </span>
  );
}

function Best({ p }: { p: PostPulse }) {
  const time = p.medianSeconds !== null ? `, and people stay about ${fmtSeconds(p.medianSeconds)}` : "";
  const talk = p.comments ? ` It has ${plural(p.comments, "comment")}.` : "";
  return (
    <div className="vb-leak">
      <p className="m-0 text-[15px] text-[var(--tq-ink-mute)]">Doing best right now</p>
      <p className="m-0 mt-1 text-[length:var(--tq-text-lg)] leading-snug">
        <a href={p.path} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-[var(--tq-surface-2)] underline-offset-4 hover:decoration-[var(--tq-ink)]">
          {p.title}
        </a>
        : {plural(p.reads, "read")}
        {time}.{talk}
      </p>
    </div>
  );
}

export function BlogPanel({ data }: { data: BlogPulseData }) {
  if (!data.configured) return null;
  const { posts, days } = data;
  const best = posts[0]?.reads ? posts[0] : null;
  const tiles = [
    { label: "Reads", value: num(data.reads), note: data.readers ? `By ${plural(data.readers, "visit")}` : "Opens of a blog post" },
    { label: "Time on a post", value: data.medianSeconds === null ? "—" : fmtSeconds(data.medianSeconds), note: "Typical, while active" },
    { label: "Read to the end", value: data.readToEnd === null ? "—" : pct(data.readToEnd), note: "Reached the bottom" },
    { label: "New comments", value: num(data.newComments), note: data.pendingComments ? `${num(data.pendingComments)} waiting for you` : "None waiting" },
  ];
  return (
    <section aria-labelledby="blog-title" className="st-card mt-6 overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5 sm:px-6">
        <h2 id="blog-title" className="st-h2">Your blog</h2>
        <Link href="/admin/comments" className="st-link">
          {data.pendingComments ? `Approve ${plural(data.pendingComments, "comment")}` : "All comments"} <ArrowIcon />
        </Link>
      </div>
      <p className="st-note mt-1 px-5 sm:px-6">Last {days} days. Time counts only while someone is on the post and active.</p>

      <dl className="m-0 mt-4 grid grid-cols-2 gap-px border-y border-[var(--tq-surface-2)] bg-[var(--tq-surface-2)] lg:grid-cols-4">
        {tiles.map((m) => (
          <div key={m.label} className="flex min-w-0 flex-col bg-white px-5 py-4 sm:px-6">
            <dt className="text-[15px] text-[var(--tq-ink-mute)]">{m.label}</dt>
            <dd className="st-num m-0 mt-2 text-[2.25rem] leading-none">{m.value}</dd>
            <dd className="m-0 mt-2 text-sm text-[var(--tq-ink-mute)]">{m.note}</dd>
          </div>
        ))}
      </dl>

      {!posts.length ? (
        <p className="m-0 px-5 py-6 text-[15px] text-[var(--tq-ink-mute)] sm:px-6">Posts show up here as families read them.</p>
      ) : (
        <>
          {best ? <Best p={best} /> : null}
          <div className="vb-head bp-cols" aria-hidden="true">
            <span>Post</span>
            <span className="text-right">Reads</span>
            <span className="text-right">Time on post</span>
            <span>Read to the end</span>
            <span className="text-right">Comments</span>
          </div>
          <ol className="m-0 list-none p-0">
            {posts.map((p) => (
              <li key={p.path} className="vb-row bp-cols">
                <span className="flex min-w-0 flex-wrap items-center gap-x-2.5">
                  <a href={p.path} target="_blank" rel="noopener noreferrer" className="vb-page">
                    {p.title}
                  </a>
                  {p.spanish ? <span className="st-chip">Spanish</span> : null}
                </span>
                <dl className="vb-stats">
                  <div>
                    <dt>Reads</dt>
                    <dd className="st-num">{num(p.reads)}</dd>
                  </div>
                  <div>
                    <dt>Time on post</dt>
                    <dd className="st-num">{p.medianSeconds === null ? "—" : fmtSeconds(p.medianSeconds)}</dd>
                  </div>
                  <div className="vb-depth">
                    <dt>Read to the end</dt>
                    <dd>
                      <Finished value={p.readToEnd} />
                    </dd>
                  </div>
                  <div>
                    <dt>Comments</dt>
                    <dd className="st-num">{num(p.comments)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
