import Link from "next/link";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

export { Select } from "@/components/Select";
export type { SelectOption } from "@/components/Select";
export { Modal, Drawer, Tooltip, Toast, Tabs, Lightbox } from "./interactive";

type Tone = "primary" | "secondary" | "quiet";

const buttonTone: Record<Tone, string> = {
  primary: "border-accent bg-accent text-white hover:border-accent-strong hover:bg-accent-strong",
  secondary: "border-line bg-white text-ink hover:border-ink-soft hover:bg-ivory",
  quiet: "border-transparent bg-transparent text-ink hover:bg-ivory",
};

function buttonClass(tone: Tone, className: string) {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none ${buttonTone[tone]} ${className}`;
}

export function Button({ tone = "primary", className = "", type = "button", loading = false, disabled, children, ...props }: ComponentProps<"button"> & { tone?: Tone; loading?: boolean }) {
  return <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClass(tone, className)} {...props}>
    {loading && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />}
    {children}
  </button>;
}

export function IconButton({ label, loading = false, className = "", type = "button", disabled, children, ...props }: Omit<ComponentProps<"button">, "aria-label"> & { label: string; loading?: boolean }) {
  return <button type={type} aria-label={label} aria-busy={loading || undefined} disabled={disabled || loading} className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors hover:border-ink hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-accent aria-pressed:bg-accent-soft ${className}`} {...props}>
    {loading ? <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" /> : children}
  </button>;
}

export function ButtonLink({ tone = "primary", className = "", ...props }: ComponentProps<typeof Link> & { tone?: Tone }) {
  return <Link className={buttonClass(tone, className)} {...props} />;
}

export function Chip({ active = false, className = "", ...props }: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${active ? "border-accent bg-accent-soft text-accent-strong" : "border-line bg-white text-ink-soft"} ${className}`}
      {...props}
    />
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong ${className}`}>{children}</span>;
}

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft ${className}`}>{children}</span>;
}

export function Field({ label, hint, error, id, className = "", ...props }: Omit<ComponentProps<"input">, "id"> & { id: string; label: string; hint?: string; error?: string }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={`min-h-11 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-ivory ${error ? "border-danger focus:border-danger" : ""} ${className}`}
        {...props}
      />
      {hint && <p id={hintId} className="text-xs text-ink-soft">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Input(props: ComponentProps<typeof Field>) {
  return <Field {...props} />;
}

export function Skeleton({ className = "", label = "Loading content" }: { className?: string; label?: string }) {
  return <span role="status" aria-label={label} className={`block animate-pulse rounded-lg bg-greige ${className}`} />;
}

export function Textarea({ label, hint, error, id, className = "", ...props }: Omit<ComponentProps<"textarea">, "id"> & { id: string; label: string; hint?: string; error?: string }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={`min-h-28 w-full resize-y rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-ivory ${error ? "border-danger focus:border-danger" : ""} ${className}`}
        {...props}
      />
      {hint && <p id={hintId} className="text-xs text-ink-soft">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Avatar({ src, alt, initials, size = 44 }: { src?: string | null; alt: string; initials: string; size?: number }) {
  return (
    <span role="img" aria-label={alt} className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-sm font-semibold text-accent-strong" style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" /> : <span aria-hidden="true">{initials}</span>}
    </span>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-solid border-line ${className}`} />;
}
