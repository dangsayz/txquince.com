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
        className="st-input pr-2"
      >
        {(Object.keys(LABEL) as PlanStatus[]).map((s) => (
          <option key={s} value={s}>{LABEL[s]}</option>
        ))}
      </select>
      {state === "error" ? <span role="alert" className="text-[13px] text-[var(--tq-status-down)]">Not saved</span> : null}
    </span>
  );
}
