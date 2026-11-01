"use client";

import { useState } from "react";
import type { PlanStatus } from "@/lib/plan";

const LABEL: Record<PlanStatus, string> = { new: "New", replied: "Replied", booked: "Booked", lost: "Lost" };

/** Per-row status picker on /admin/plans; saves on change. */
export function PlanStatusSelect({ id, status, family }: { id: string; status: PlanStatus; family: string }) {
  const [value, setValue] = useState<PlanStatus>(status);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function change(next: PlanStatus) {
    const prev = value;
    setValue(next);
    setState("saving");
    const res = await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    }).catch(() => null);
    if (!res?.ok) {
      setValue(prev);
      setState("error");
      return;
    }
    setState("idle");
  }

  return (
    <span className="inline-flex items-center gap-2">
      <label className="sr-only" htmlFor={`plan-status-${id}`}>Status for {family}</label>
      <select
        id={`plan-status-${id}`}
        value={value}
        onChange={(e) => change(e.target.value as PlanStatus)}
        disabled={state === "saving"}
        className="min-h-11 rounded-sm border border-[#dcdcd9] bg-white px-2.5 text-base text-[#252525] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]"
      >
        {(Object.keys(LABEL) as PlanStatus[]).map((s) => (
          <option key={s} value={s}>{LABEL[s]}</option>
        ))}
      </select>
      {state === "error" ? <span role="alert" className="text-xs text-[#8f4039]">Not saved</span> : null}
    </span>
  );
}
