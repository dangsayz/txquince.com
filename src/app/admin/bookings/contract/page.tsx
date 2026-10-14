import Link from "next/link";
import { redirect } from "next/navigation";
import { journeyDeps } from "@/lib/journey/deps";
import { CANCELLATION_POLICY } from "@/lib/journey/policy";
import { normalizeOverrides } from "@/lib/journey/contract";
import { TemplateEditor } from "@/components/admin/journey/forms";

export const dynamic = "force-dynamic";

/** /admin/bookings/contract — versioned overrides for the agreement families sign. */
export default async function ContractTemplatePage() {
  const deps = journeyDeps();
  if (!(await deps.adminEmail())) redirect("/admin/login?next=/admin/bookings/contract");
  const t = await deps.db.latestTemplate().catch(() => null);
  const block = (lang: "en" | "es") => {
    const o = t ? normalizeOverrides(t[lang]) : {};
    return {
      changes: (o.changes ?? []).join("\n"),
      extraTitle: o.extra?.[0]?.title ?? "",
      extraLines: (o.extra?.[0]?.lines ?? []).join("\n"),
    };
  };

  return (
    <main className="mx-auto max-w-[60rem] px-4 pb-24 pt-8 text-[#111110] sm:px-8 lg:pt-11">
      <Link href="/admin/bookings" className="inline-flex min-h-11 items-center text-base hover:underline">
        ← All bookings
      </Link>
      <h1 className="mt-4 text-[clamp(1.7rem,2.5vw,2.25rem)] font-normal tracking-[-0.035em]">Contract template</h1>
      <p className="mt-3 max-w-[62ch] text-base leading-7">
        {t ? `Current version: ${t.version}, saved ${new Date(t.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" })} by ${t.created_by}.` : "No custom version yet — families see the built-in wording."}{" "}
        Each save is a new version. Families who already signed keep exactly what they signed; approved families who haven&rsquo;t signed yet see the newest version.
      </p>
      <details className="mt-6 border border-[#e5e5e3] bg-white p-4">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-base font-medium">Built-in cancellation policy (needs your review)</summary>
        {(["en", "es"] as const).map((l) => (
          <ul key={l} className="mt-3 list-disc pl-5 text-base">
            {CANCELLATION_POLICY[l].lines.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ))}
      </details>
      <div className="mt-8">
        <TemplateEditor initial={{ en: block("en"), es: block("es"), note: "" }} />
      </div>
    </main>
  );
}
