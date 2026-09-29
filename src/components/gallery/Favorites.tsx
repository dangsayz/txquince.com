"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "txq-saved-photos";
const CHANGE_EVENT = "txq-saved-photos-change";

export function photoKey(section: string, slug: string): string {
  return `${section}/${slug}`;
}

function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter((entry): entry is string => typeof entry === "string" && /^[a-z0-9-]+\/[a-z0-9-]+$/i.test(entry))
      : [];
  } catch {
    return [];
  }
}

export function useSavedPhotos() {
  const [saved, setSaved] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const refresh = () => setSaved(readSaved());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, []);

  function toggle(key: string) {
    try {
      const next = readSaved();
      const index = next.indexOf(key);
      if (index === -1) next.push(key);
      else next.splice(index, 1);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setAvailable(true);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      setAvailable(false);
    }
  }

  return { saved, toggle, available };
}

export function FavoriteButton({ section, slug, className = "", onToggle }: {
  section: string;
  slug: string;
  className?: string;
  onToggle?: () => void;
}) {
  const { saved, toggle, available } = useSavedPhotos();
  const key = photoKey(section, slug);
  const active = saved.includes(key);

  return (
    <button
      type="button"
      onClick={() => { toggle(key); onToggle?.(); }}
      aria-pressed={active}
      aria-label={active ? "Remove from saved photos" : "Save photo"}
      title={available ? undefined : "Saving is unavailable in this browser"}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      <span aria-hidden className="text-lg leading-none">{active ? "♥" : "♡"}</span>
      {active ? "Saved" : "Save"}
    </button>
  );
}
