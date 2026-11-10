import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";
import { StudioPage } from "@/components/admin/StudioPage";
import { RefundTestPayment, StartTestPayment, WaitForStripe } from "@/components/admin/TestPaymentButtons";
import { getPaymentTest, latestPaymentTests, testAgeMs, type PaymentTest } from "@/lib/payment-test";
import { retrieveStripeCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment test · TX Quince Studio" };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

function Row({ ok, wait, label, detail }: { ok: boolean; wait?: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3 border-t border-[var(--tq-surface-2)] px-5 py-4">
      <span className="st-chip" data-tone={ok ? "good" : wait ? undefined : "urgent"}>{ok ? "Passed" : wait ? "Waiting" : "Failed"}</span>
      <span className="grid gap-1">
        <span className="text-[16px] font-medium text-[var(--tq-ink)]">{label}</span>
        <span className="text-[15px] text-[var(--tq-ink-mute)]">{detail}</span>
      </span>
    </li>
  );
}

function Result({ t, paid, ageMs }: { t: PaymentTest; paid: boolean; ageMs: number }) {
  if (!paid) {
    return (
      <p className="st-card m-0 px-5 py-4 text-[16px] leading-relaxed">
        The test from {when(t.createdAt)} was not paid, so nothing was charged. Tap <strong>Pay $1 to test</strong> to try again.
      </p>
    );
  }
  const waiting = !t.receivedAt && ageMs < 3 * 60 * 1000;
  const failed = !t.receivedAt && !waiting;
  return (
    <section className="st-card overflow-hidden" aria-label="Result of your test">
      <WaitForStripe waiting={waiting} />
      <h2 className="m-0 px-5 py-4 text-[18px] font-medium">Your test from {when(t.createdAt)}</h2>
      <ul className="m-0 list-none p-0" role="status">
        <Row ok label="Stripe took your $1" detail="Stripe confirms the payment went through." />
        <Row
          ok={Boolean(t.receivedAt)}
          wait={waiting}
          label="The site got Stripe’s message"
          detail={
            t.receivedAt
              ? `Received ${when(t.receivedAt)}. This is what marks a mom’s booking as Booked.`
              : waiting
                ? "Usually takes a few seconds. This page checks again by itself."
                : "Nothing arrived after 3 minutes. A mom’s payment would NOT mark her booking as Booked. Tell Claude: the webhook is not delivering."
          }
        />
        {t.receivedAt ? (
          <Row ok={t.amountOk === true} label="The amount matched" detail={t.amountOk ? "Stripe collected exactly $1.00." : "Stripe collected a different amount than the site asked for."} />
        ) : null}
        {t.refundedAt ? <Row ok label="Refunded" detail={`You refunded the $1 on ${when(t.refundedAt)}. It returns to your card in a few days.`} /> : null}
      </ul>
      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--tq-surface-2)] px-5 py-4">
        {t.receivedAt && !t.refundedAt ? <RefundTestPayment id={t.id} /> : null}
        {failed ? <span className="text-[15px] text-[var(--tq-status-down)]">You can still refund the $1 in Stripe.</span> : null}
        <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" className="st-link">Open Stripe payments <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}

/** /admin/test-payment — pay $1 with a real card to prove payments work end to end. */
export default async function TestPayment({ searchParams }: { searchParams: Promise<{ test?: string }> }) {
  await requireAdminPage("/admin/test-payment");
  const { test } = await searchParams;
  const current = test ? await getPaymentTest(test) : null;
  // Ask Stripe directly, so "paid but the site never heard" is told apart from "never paid".
  let paid = Boolean(current?.receivedAt);
  if (current && !paid && current.sessionId) {
    paid = await retrieveStripeCheckoutSession(current.sessionId).then((s) => s.payment_status === "paid", () => false);
  }
  const past = (await latestPaymentTests()).filter((t) => t.id !== current?.id && t.sessionId);

  return (
    <StudioPage
      title="Payment test"
      intro="Pay $1 with your own card to prove that a mom’s payment reaches the site. Then refund it here."
      back={{ href: "/admin/payments", label: "Payments" }}
      actions={<StartTestPayment />}
    >
      <div className="grid gap-4">
        {current ? <Result t={current} paid={paid} ageMs={testAgeMs(current)} /> : (
          <p className="st-card m-0 px-5 py-4 text-[16px] leading-relaxed">
            Tap <strong>Pay $1 to test</strong>, pay on Stripe&apos;s page, and you come back here. This page then shows if the site received Stripe&apos;s message.
          </p>
        )}
        {past.length > 0 ? (
          <section className="st-card overflow-hidden" aria-label="Earlier tests">
            <h2 className="m-0 px-5 py-4 text-[18px] font-medium">Earlier tests</h2>
            <ul className="m-0 list-none p-0">
              {past.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 border-t border-[var(--tq-surface-2)] px-5 py-3 text-[15px]">
                  <span className="st-chip" data-tone={t.receivedAt ? "good" : undefined}>{t.receivedAt ? "Passed" : "Not finished"}</span>
                  <span>{when(t.createdAt)}</span>
                  {t.refundedAt ? <span className="text-[var(--tq-ink-mute)]">refunded</span> : null}
                  <Link href={`/admin/test-payment?test=${t.id}`} className="st-link">Open</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </StudioPage>
  );
}
