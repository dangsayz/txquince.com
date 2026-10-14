"use client";

/**
 * Owner controls on /admin/bookings/[id]. Every control is a thin client over
 * an admin API route that re-checks the admin, the booking and its state on
 * the server. Buttons that send email or move money ask first.
 */
import { useId, useState } from "react";
import { useRouter } from "next/navigation";

const btn =
  "inline-flex min-h-12 items-center justify-center whitespace-nowrap px-5 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111110] disabled:opacity-50";
export const primaryBtn = `${btn} bg-[#111110] text-white hover:bg-[#333331]`;
export const secondaryBtn = `${btn} border border-[#8c877f] bg-white text-[#111110] hover:border-[#111110]`;
const input =
  "min-h-12 w-full border border-[#8c877f] bg-white px-3 text-base text-[#111110] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#111110]";
const label = "text-sm font-medium text-[#111110]";

async function post(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok && data.ok !== false, data };
  } catch {
    return { ok: false, data: { error: "Check your connection and try again." } };
  }
}

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const run = async (url: string, body: unknown, done?: (d: Record<string, unknown>) => string | void) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const r = await post(url, body);
    setBusy(false);
    if (!r.ok) {
      setError(String(r.data.error ?? "That didn't go through."));
      return false;
    }
    const msg = done?.(r.data);
    if (msg) setNotice(msg);
    router.refresh();
    return true;
  };
  return { busy, error, notice, run };
}

function Feedback({ error, notice }: { error: string | null; notice: string | null }) {
  return (
    <>
      {notice && (
        <p role="status" className="mt-3 break-words text-base text-[#111110]">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-base text-[#9a2a12]">
          {error}
        </p>
      )}
    </>
  );
}

/* ---------------- the main action bar ---------------- */

export function ActionBar({
  id,
  status,
  depositPercent,
  depositLabel,
  remainingLabel,
  canSendBalance,
  canConfirmReview,
}: {
  id: string;
  status: string;
  depositPercent: number;
  depositLabel: string;
  remainingLabel: string;
  canSendBalance: boolean;
  canConfirmReview: boolean;
}) {
  const { busy, error, notice, run } = useAction();
  const [link, setLink] = useState<string | null>(null);
  const act = (action: string, confirmMsg: string | null, note?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    void run(`/api/admin/bookings/${id}`, { action, note }, (d) => {
      if (typeof d.url === "string") setLink(d.url);
      return action === "family_link" ? "New private link made. Copy it below." : "Done.";
    });
  };
  const ask = (action: "decline" | "cancel", q: string) => {
    const note = window.prompt(q + "\n\nOptional note for the family's email (leave empty for none):", "");
    if (note === null) return;
    act(action, null, note);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(status === "requested" || status === "expired") && (
          <button
            type="button"
            className={primaryBtn}
            disabled={busy}
            onClick={() =>
              act(
                "approve",
                `Approve this date? The family gets an email to sign their agreement and pay the ${depositPercent}% deposit (${depositLabel}).`,
              )
            }
          >
            Approve
          </button>
        )}
        {(status === "requested" || status === "approved") && (
          <button type="button" className={secondaryBtn} disabled={busy} onClick={() => ask("decline", "Decline this booking? The family is emailed, the date is freed, and any open checkout is closed.")}>
            Decline
          </button>
        )}
        {canSendBalance && (
          <button
            type="button"
            className={primaryBtn}
            disabled={busy}
            onClick={() => act("send_balance_link", `Email the family a link to pay their balance (${remainingLabel})? They pay only if they click.`)}
          >
            Send balance link
          </button>
        )}
        {canConfirmReview && (
          <button type="button" className={primaryBtn} disabled={busy} onClick={() => act("confirm_review", "Mark this booking as booked? Do this only if the payment is correct.")}>
            Confirm booking
          </button>
        )}
        {(status === "confirmed" || status === "paid_in_full") && (
          <button type="button" className={secondaryBtn} disabled={busy} onClick={() => act("complete", "Mark this booking completed (the event happened)?")}>
            Mark completed
          </button>
        )}
        {["confirmed", "paid_in_full", "payment_review"].includes(status) && (
          <button
            type="button"
            className={secondaryBtn}
            disabled={busy}
            onClick={() => ask("cancel", "Cancel this booking? The family is emailed. No money is refunded automatically — use Refund below if you owe them money.")}
          >
            Cancel booking
          </button>
        )}
        <button type="button" className={secondaryBtn} disabled={busy} onClick={() => act("family_link", null)}>
          Copy family link
        </button>
      </div>
      {link && (
        <p className="mt-3 break-all text-base">
          <a href={link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {link}
          </a>
        </p>
      )}
      <Feedback error={error} notice={notice} />
    </div>
  );
}

/* ---------------- payments ---------------- */

export function OfflinePaymentForm({ id, remainingCents }: { id: string; remainingCents: number }) {
  const { busy, error, notice, run } = useAction();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("zelle");
  const [note, setNote] = useState("");
  const uid = useId();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) return;
    if (!window.confirm(`Record $${(cents / 100).toFixed(2)} paid by ${method}? The family gets a receipt email.`)) return;
    if (await run(`/api/admin/bookings/${id}/payment`, { amountCents: cents, method, note }, () => "Payment recorded.")) {
      setAmount("");
      setNote("");
    }
  };
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,10rem)_minmax(0,1fr)_auto] sm:items-end">
      <div className="grid gap-1">
        <label className={label} htmlFor={`${uid}-amt`}>
          Amount ($)
        </label>
        <input id={`${uid}-amt`} className={input} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={(remainingCents / 100).toFixed(2)} />
      </div>
      <div className="grid gap-1">
        <label className={label} htmlFor={`${uid}-m`}>
          Paid by
        </label>
        <select id={`${uid}-m`} className={input} value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="zelle">Zelle</option>
          <option value="cash">Cash</option>
          <option value="check">Check</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="grid gap-1">
        <label className={label} htmlFor={`${uid}-n`}>
          Note (optional)
        </label>
        <input id={`${uid}-n`} className={input} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
      </div>
      <button type="submit" className={primaryBtn} disabled={busy || !amount}>
        Record payment
      </button>
      <div className="sm:col-span-4">
        <Feedback error={error} notice={notice} />
      </div>
    </form>
  );
}

export function RefundForm({ id, paymentId, maxCents, label: what }: { id: string; paymentId: string; maxCents: number; label: string }) {
  const { busy, error, notice, run } = useAction();
  const [amount, setAmount] = useState("");
  const [requestId] = useState(() => crypto.randomUUID());
  const uid = useId();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) return;
    if (cents > maxCents) return void window.alert(`You can refund at most $${(maxCents / 100).toFixed(2)} of this payment.`);
    if (!window.confirm(`Refund $${(cents / 100).toFixed(2)} of ${what} to the family's card now? This sends real money back through Stripe.`)) return;
    if (await run(`/api/admin/bookings/${id}/refund`, { paymentId, amountCents: cents, requestId }, () => "Refund sent. The family was emailed.")) setAmount("");
  };
  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-end gap-2">
      <div className="grid gap-1">
        <label className={label} htmlFor={`${uid}-r`}>
          Refund amount ($), up to {(maxCents / 100).toFixed(2)}
        </label>
        <input id={`${uid}-r`} className={`${input} max-w-[12rem]`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <button type="submit" className={secondaryBtn} disabled={busy || !amount}>
        Refund…
      </button>
      <div className="w-full">
        <Feedback error={error} notice={notice} />
      </div>
    </form>
  );
}

/* ---------------- messages + notes ---------------- */

export function TextPostForm({ url, cta, fieldLabel, confirmMsg, done }: { url: string; cta: string; fieldLabel: string; confirmMsg?: string; done: string }) {
  const { busy, error, notice, run } = useAction();
  const [body, setBody] = useState("");
  const uid = useId();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    if (await run(url, { body }, () => done)) setBody("");
  };
  return (
    <form onSubmit={submit} className="grid gap-2">
      <label className={label} htmlFor={`${uid}-b`}>
        {fieldLabel}
      </label>
      <textarea id={`${uid}-b`} className={`${input} min-h-28 py-2`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} />
      <div>
        <button type="submit" className={primaryBtn} disabled={busy || !body.trim()}>
          {cta}
        </button>
      </div>
      <Feedback error={error} notice={notice} />
    </form>
  );
}

/* ---------------- delivery ---------------- */

export function DeliveryForm({
  id,
  initial,
}: {
  id: string;
  initial: { gallery_url: string; video_url: string; review_url: string; album_status: string; delivery_note: string };
}) {
  const { busy, error, notice, run } = useAction();
  const [f, setF] = useState(initial);
  const uid = useId();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const save = async (notify: boolean) => {
    if (notify && !window.confirm("Save and email the family about their delivery?")) return;
    await run(`/api/admin/bookings/${id}/delivery`, { ...f, notify }, () => (notify ? "Saved and emailed." : "Saved."));
  };
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void save(false);
      }}
    >
      {(
        [
          ["gallery_url", "Gallery link (https://…)"],
          ["video_url", "Video link (https://…)"],
          ["review_url", "Google review link (https://…)"],
        ] as const
      ).map(([k, l]) => (
        <div key={k} className="grid gap-1">
          <label className={label} htmlFor={`${uid}-${k}`}>
            {l}
          </label>
          <input id={`${uid}-${k}`} className={input} type="url" inputMode="url" value={f[k]} onChange={set(k)} />
        </div>
      ))}
      <div className="grid gap-1">
        <label className={label} htmlFor={`${uid}-album`}>
          Album
        </label>
        <select id={`${uid}-album`} className={input} value={f.album_status} onChange={set("album_status")}>
          <option value="not_started">Not started</option>
          <option value="designing">Designing</option>
          <option value="sent_for_approval">Sent for approval</option>
          <option value="printing">Printing</option>
          <option value="shipped">Shipped</option>
        </select>
      </div>
      <div className="grid gap-1">
        <label className={label} htmlFor={`${uid}-note`}>
          Note shown to the family (optional)
        </label>
        <textarea id={`${uid}-note`} className={`${input} min-h-24 py-2`} value={f.delivery_note} onChange={set("delivery_note")} maxLength={1000} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={primaryBtn} disabled={busy}>
          Save
        </button>
        <button type="button" className={secondaryBtn} disabled={busy} onClick={() => void save(true)}>
          Save &amp; email family
        </button>
      </div>
      <Feedback error={error} notice={notice} />
    </form>
  );
}

/* ---------------- contract template ---------------- */

type LangBlock = { changes: string; extraTitle: string; extraLines: string };

export function TemplateEditor({ initial }: { initial: { en: LangBlock; es: LangBlock; note: string } }) {
  const { busy, error, notice, run } = useAction();
  const [f, setF] = useState(initial);
  const uid = useId();
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const block = (b: LangBlock) => ({
    changes: lines(b.changes),
    extra: b.extraTitle.trim() && lines(b.extraLines).length ? [{ title: b.extraTitle.trim(), lines: lines(b.extraLines) }] : [],
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Save a new contract version? Families who already signed keep what they signed.")) return;
    await run("/api/admin/contract-template", { en: block(f.en), es: block(f.es), note: f.note }, (d) => `Saved as version ${String(d.version)}.`);
  };
  const L = (lang: "en" | "es", k: keyof LangBlock) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [lang]: { ...f[lang], [k]: e.target.value } });
  return (
    <form onSubmit={submit} className="grid gap-8">
      {(["en", "es"] as const).map((lang) => (
        <fieldset key={lang} className="grid gap-4 border border-[#e5e5e3] p-4 sm:p-6">
          <legend className="px-1 text-base font-semibold">{lang === "en" ? "English" : "Español"}</legend>
          <div className="grid gap-1">
            <label className={label} htmlFor={`${uid}-${lang}-c`}>
              Changes and cancellations — one line per rule (empty = the built-in policy)
            </label>
            <textarea id={`${uid}-${lang}-c`} className={`${input} min-h-40 py-2`} value={f[lang].changes} onChange={L(lang, "changes")} />
          </div>
          <div className="grid gap-1">
            <label className={label} htmlFor={`${uid}-${lang}-t`}>
              Extra section title (optional)
            </label>
            <input id={`${uid}-${lang}-t`} className={input} value={f[lang].extraTitle} onChange={L(lang, "extraTitle")} />
          </div>
          <div className="grid gap-1">
            <label className={label} htmlFor={`${uid}-${lang}-l`}>
              Extra section — one line per point
            </label>
            <textarea id={`${uid}-${lang}-l`} className={`${input} min-h-28 py-2`} value={f[lang].extraLines} onChange={L(lang, "extraLines")} />
          </div>
        </fieldset>
      ))}
      <div className="grid gap-1">
        <label className={label} htmlFor={`${uid}-note`}>
          What changed (for your records)
        </label>
        <input id={`${uid}-note`} className={input} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} maxLength={300} />
      </div>
      <div>
        <button type="submit" className={primaryBtn} disabled={busy}>
          Save new version
        </button>
      </div>
      <Feedback error={error} notice={notice} />
    </form>
  );
}
