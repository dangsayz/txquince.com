import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { journeyDeps } from "@/lib/journey/deps";
import { adminRecord } from "@/lib/journey/admin-read";
import { STATUS_LABEL } from "@/lib/journey/state";
import { refFor } from "@/lib/journey/ref";
import { ADD_ON_NAME_EN, TIER_NAME_EN, type TierId } from "@/lib/commission";
import { ActionBar, DeliveryForm, OfflinePaymentForm, RefundForm, TextPostForm } from "@/components/admin/journey/forms";

export const dynamic = "force-dynamic";

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
const day = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso.slice(0, 10)}T12:00:00Z`),
  );
const when = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }).format(new Date(iso));

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border border-[#e5e5e3] bg-white px-4 py-6 sm:px-6">
      <h2 id={id} className="text-lg font-medium tracking-[-0.02em]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-[#ededeb] text-base">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-3">
          <dt className="font-medium">{k}</dt>
          <dd className="min-w-0 break-words">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function BookingRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deps = journeyDeps();
  const rec = await adminRecord(deps, id);
  if (rec === "unauthorized") redirect(`/admin/login?next=/admin/bookings/${id}`);
  if (!rec) notFound();
  const { b, ledger, payments, events, messages, notes, reminders, sessions } = rec;
  const unread = messages.filter((m) => m.author === "family" && !m.read_at).length;
  if (unread) await deps.db.markFamilyMessagesRead(b.id, deps.now().toISOString()).catch(() => undefined);

  const tier = (b.request?.tier ?? b.metadata?.tier) as TierId | undefined;
  const r = b.request;
  const canSendBalance = b.status === "confirmed" && ledger.remainingCents > 0;
  const canConfirmReview = b.status === "payment_review" && Boolean(b.signed_at) && ledger.depositPaid;
  const booked = ["confirmed", "paid_in_full", "completed"].includes(b.status);

  return (
    <main className="mx-auto max-w-[86rem] px-4 pb-24 pt-8 text-[#111110] sm:px-8 lg:px-12 lg:pt-11">
      <Link href="/admin/bookings" className="inline-flex min-h-11 items-center text-base underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111110]">
        ← All bookings
      </Link>
      <header className="mt-4 border-b border-[#e5e5e3] pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          Booking record · {refFor(b.id)} · {b.lang === "es" ? "Español" : "English"}
        </p>
        <h1 className="mt-3 break-words text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-[1.15] tracking-[-0.04em]">{b.name}</h1>
        <p className="mt-2 text-base">
          {day(b.event_date)}
          {r?.venue ? ` · ${r.venue}` : ""}
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-3 text-base">
          <span className="inline-flex min-h-8 items-center border-2 border-[#111110] px-3 font-medium">{STATUS_LABEL[b.status]}</span>
          {(b.status === "requested" || b.status === "approved") && <span>Hold ends {when(b.expires_at)}</span>}
        </p>
        <div className="mt-6">
          <ActionBar
            id={b.id}
            status={b.status}
            depositPercent={b.deposit_percent ?? 25}
            depositLabel={money(b.deposit_amount_cents)}
            remainingLabel={money(ledger.remainingCents)}
            canSendBalance={canSendBalance}
            canConfirmReview={canConfirmReview}
          />
        </div>
      </header>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)]">
        <div className="grid gap-6">
          <Section title={`Messages${unread ? ` · ${unread} new` : ""}`} id="sec-messages">
            {messages.length === 0 ? (
              <p className="text-base">No messages yet.</p>
            ) : (
              <ol className="grid gap-3">
                {messages.map((m) => (
                  <li key={m.id} className={`border-l-2 px-4 py-2 ${m.author === "owner" ? "border-[#111110] bg-[#f7f7f5]" : "border-[#8c877f]"}`}>
                    <p className="text-sm font-medium">
                      {m.author === "family" ? b.name : `You (${m.author_email ?? "owner"})`} · {when(m.created_at)}
                      {m.kind !== "message" ? ` · ${m.kind.replace("_", " ").toUpperCase()}` : ""}
                      {m.author === "family" && !m.read_at ? " · NEW" : ""}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-base">{m.body}</p>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-5">
              <TextPostForm url={`/api/admin/bookings/${b.id}/message`} fieldLabel="Reply (emailed to the family)" cta="Send reply" confirmMsg="Email this reply to the family?" done="Reply sent." />
            </div>
          </Section>

          <Section title="Payments" id="sec-payments">
            <Rows
              rows={[
                ["Total", money(ledger.totalCents)],
                [`Deposit (${b.deposit_percent ?? 25}%)`, `${money(ledger.depositCents)}${ledger.depositPaid ? " · paid" : ""}`],
                ["Balance due", b.balance_due_date ? `${day(b.balance_due_date)} (${b.balance_due_days} days before)` : "—"],
                ["Received", money(ledger.paidCents)],
                ["Refunded", money(ledger.refundedCents)],
                ["Left to pay", money(ledger.remainingCents)],
              ]}
            />
            <h3 className="mt-6 text-base font-semibold">Ledger</h3>
            {payments.length === 0 ? (
              <p className="mt-2 text-base">No payments yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-[#ededeb] border-y border-[#ededeb]">
                {payments.map((p) => (
                  <li key={p.id} className="py-3 text-base">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-medium">
                        {p.kind === "refund" ? "Refund" : p.kind[0]!.toUpperCase() + p.kind.slice(1)} · {p.method}
                      </span>
                      <span className="tabular-nums">{p.kind === "refund" ? `−${money(p.amount_cents)}` : money(p.amount_cents)}</span>
                    </div>
                    <p className="text-sm break-all">
                      {when(p.created_at)}
                      {p.recorded_by ? ` · ${p.recorded_by}` : ""}
                      {p.stripe_payment_intent_id ? ` · ${p.stripe_payment_intent_id}` : ""}
                      {p.stripe_refund_id ? ` · ${p.stripe_refund_id}` : ""}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                    {p.refundable > 0 && <RefundForm id={b.id} paymentId={p.id} maxCents={p.refundable} label={`the ${money(p.amount_cents)} ${p.kind}`} />}
                  </li>
                ))}
              </ul>
            )}
            {["approved", "confirmed", "payment_review"].includes(b.status) && ledger.remainingCents > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-base font-semibold">Record a payment made outside Stripe</h3>
                <OfflinePaymentForm id={b.id} remainingCents={ledger.remainingCents} />
              </div>
            )}
            {sessions.length > 0 && (
              <details className="mt-6">
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-base font-medium">Checkout sessions ({sessions.length})</summary>
                <ul className="mt-2 text-sm">
                  {sessions.map((s) => (
                    <li key={s.id} className="break-all py-1">
                      {s.kind} · {money(s.amount_cents)} · {s.status} · {s.id}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </Section>

          {booked && (
            <Section title="Delivery" id="sec-delivery">
              <DeliveryForm
                id={b.id}
                initial={{
                  gallery_url: b.gallery_url ?? "",
                  video_url: b.video_url ?? "",
                  review_url: b.review_url ?? "",
                  album_status: b.album_status ?? "not_started",
                  delivery_note: b.delivery_note ?? "",
                }}
              />
            </Section>
          )}

          <Section title="Timeline" id="sec-timeline">
            <ol className="grid gap-2">
              {events.map((e) => (
                <li key={e.id} className="grid gap-x-3 text-base sm:grid-cols-[11rem_minmax(0,1fr)]">
                  <span className="text-sm tabular-nums">{when(e.at)}</span>
                  <span className="min-w-0 break-all">
                    <strong className="font-medium">{e.event}</strong> · {e.actor}
                    {e.actor_email ? ` (${e.actor_email})` : ""}
                    {e.ip ? ` · IP ${e.ip}` : ""}
                    {e.detail ? ` · ${e.detail}` : ""}
                  </span>
                </li>
              ))}
            </ol>
            {reminders.length > 0 && <p className="mt-4 text-sm">Reminders sent: {reminders.map((x) => x.kind).join(", ")}</p>}
          </Section>
        </div>

        <aside className="grid gap-6">
          <Section title="Details" id="sec-details">
            <Rows
              rows={[
                ["Email", <a key="e" href={`mailto:${b.email}`} className="underline underline-offset-4">{b.email}</a>],
                ["Phone", b.phone ? <a key="p" href={`tel:${b.phone}`} className="underline underline-offset-4">{b.phone}</a> : null],
                ["Package", tier && tier in TIER_NAME_EN ? `${TIER_NAME_EN[tier]}${r?.hours ? ` · ${r.hours} hours` : ""}` : b.package],
                ["Extras", r?.addOns?.length ? r.addOns.map((a) => ADD_ON_NAME_EN[a]).join(", ") : "None"],
                ["Team", r?.crew ? `${r.crew.photo} photo · ${r.crew.motion} video` : null],
                ["Quinceañera", r?.honoree],
                ["Area", r?.cityLabel],
                ["Venue", r?.venue],
                ["Starts", r?.startTime],
                ["Share photos", r ? (r.sharePermission ? "Yes" : "No") : null],
                ["Requested", when(b.created_at)],
              ]}
            />
            {r?.note && (
              <div className="mt-4 border-t border-[#ededeb] pt-4">
                <h3 className="text-base font-semibold">Their note</h3>
                <p className="mt-1 whitespace-pre-wrap break-words text-base">{r.note}</p>
              </div>
            )}
          </Section>

          <Section title="Price snapshot (frozen at request)" id="sec-snapshot">
            <Rows
              rows={[
                ["Total", b.total_cents != null ? money(b.total_cents) : "—"],
                ["Deposit", `${money(b.deposit_amount_cents)} (${b.deposit_percent ?? "?"}%)`],
                ["Balance", b.balance_cents != null ? money(b.balance_cents) : "—"],
                ["Due", b.balance_due_days != null ? `${b.balance_due_days} days before the event` : "—"],
                ["Price book saved", b.price_book?.updatedAt ? when(b.price_book.updatedAt) : "Launch defaults"],
              ]}
            />
          </Section>

          <Section title="Documents" id="sec-docs">
            {b.signed_at && b.agreement ? (
              <>
                <Rows
                  rows={[
                    ["Signed by", b.agreement.signedName],
                    ["Signed", when(b.signed_at)],
                    ["IP", b.agreement.ip],
                    ["Agreement", `${b.agreement.version}${"templateVersion" in b.agreement ? ` · template v${b.agreement.templateVersion}` : ""}`],
                    ["E-sign consent", "consentVersion" in b.agreement ? b.agreement.consentVersion : "—"],
                    ["sha256", <code key="s" className="break-all text-sm">{b.contract_sha256 ?? "—"}</code>],
                  ]}
                />
                <a
                  href={`/api/admin/bookings/${b.id}/contract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-12 items-center border border-[#8c877f] px-5 text-base font-medium hover:border-[#111110]"
                >
                  Open signed PDF
                </a>
              </>
            ) : (
              <p className="text-base">Not signed yet.</p>
            )}
          </Section>

          <Section title="Private notes" id="sec-notes">
            {notes.length > 0 && (
              <ol className="mb-4 grid gap-3">
                {notes.map((n) => (
                  <li key={n.id} className="border-l-2 border-[#8c877f] px-3">
                    <p className="text-sm font-medium">
                      {n.author_email} · {when(n.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-base">{n.body}</p>
                  </li>
                ))}
              </ol>
            )}
            <TextPostForm url={`/api/admin/bookings/${b.id}/note`} fieldLabel="Add a private note (never shown to the family)" cta="Save note" done="Note saved." />
          </Section>
        </aside>
      </div>
    </main>
  );
}
