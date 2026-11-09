"use client";

import { Intake } from "@/components/txq/Intake";
import { HideDock } from "@/components/plan/HideDock";

/** The booking panel inside the dashboard: files a real, signed booking under the account's email. */
export function AccountBook({ email, done }: { email: string; done: string }) {
  return (
    <>
      <HideDock />
      <Intake account={{ email, done }} />
    </>
  );
}
