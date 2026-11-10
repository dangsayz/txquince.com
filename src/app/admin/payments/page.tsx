import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";
import { StudioPage } from "@/components/admin/StudioPage";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { MoneyRows, usd } from "@/components/admin/MoneyPanel";
import { getMoney } from "@/lib/money-db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payments · TX Quince Studio" };

/** /admin/payments — every payment the site received, newest first. */
export default async function Payments() {
  await requireAdminPage("/admin/payments");
  const money = await getMoney(100);
  const now = new Date();
  const month = now.toLocaleDateString("en-US", { month: "long", timeZone: "America/Chicago" });
  return (
    <StudioPage
      title="Payments"
      intro={
        money.monthCount
          ? `${usd(money.monthCents)} received in ${month}, from ${money.monthCount} ${money.monthCount === 1 ? "payment" : "payments"}. Refunds and your own tests are not counted.`
          : `No family payments in ${month} yet. Each payment shows here within a minute.`
      }
      actions={
        <>
          <Link href="/admin/test-payment" className="st-btn-ghost">Test a $1 payment</Link>
          <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" className="st-btn-ghost">Open Stripe <span aria-hidden="true">↗</span></a>
        </>
      }
    >
      <AutoRefresh seconds={45} />
      <section className="st-card overflow-hidden" aria-label="All payments">
        {money.rows.length ? (
          <div className="-mt-px"><MoneyRows rows={money.rows} now={now} /></div>
        ) : (
          <p className="m-0 px-5 py-5 text-[16px] sm:px-6">Nothing yet. Deposits, balance payments and your $1 tests all show here.</p>
        )}
      </section>
    </StudioPage>
  );
}
