"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export function SignOutNow({ enabled, to }: { enabled: boolean; to: string }) {
  if (!enabled) return <Go to={to} />;
  return <Inner to={to} />;
}

function Go({ to }: { to: string }) {
  useEffect(() => window.location.replace(to), [to]);
  return <p role="status">Logging out…</p>;
}

function Inner({ to }: { to: string }) {
  const clerk = useClerk();
  useEffect(() => {
    if (!clerk.loaded) return;
    try {
      window.localStorage.removeItem("txq_admin");
    } catch {
      /* ignore */
    }
    void clerk.signOut({ redirectUrl: to });
  }, [clerk, clerk.loaded, to]);
  return <p role="status">Logging out…</p>;
}
