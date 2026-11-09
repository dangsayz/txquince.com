"use client";

import { useEffect, useState } from "react";
import { AccountPanel } from "./AccountPanel";

/** /admin/login body: log in, then let the server decide if this account is the admin. */
export function AdminLogin({ enabled, next }: { enabled: boolean; next: string }) {
  return (
    <AccountPanel
      lang="en"
      enabled={enabled}
      returnPath={`/admin/login?next=${encodeURIComponent(next)}`}
      signedIn={({ name, signOut }) => <Check name={name} next={next} signOut={signOut} />}
    />
  );
}

function Check({ name, next, signOut }: { name: string; next: string; signOut: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "denied" | "error">("checking");
  useEffect(() => {
    let live = true;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ admin?: boolean }>)
      .then((d) => {
        if (!live) return;
        if (d.admin) {
          try {
            window.localStorage.setItem("txq_admin", "1");
          } catch {
            /* ignore */
          }
          window.location.replace(next);
        } else setState("denied");
      })
      .catch(() => live && setState("error"));
    return () => {
      live = false;
    };
  }, [next]);

  if (state === "checking") return <p className="tq-auth__note" role="status">Opening the studio…</p>;
  return (
    <div className="tq-auth">
      <p className="tq-auth__lead" role="alert">
        {state === "denied"
          ? `${name}, this account does not have studio access. Log out, then log in with the owner's email.`
          : "Could not check your access. Refresh and try again."}
      </p>
      <div className="tq-auth__actions">{signOut}</div>
    </div>
  );
}
