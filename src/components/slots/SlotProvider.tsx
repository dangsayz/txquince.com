"use client";

/**
 * Image slots for client-rendered sections (the homepage). The page (a server
 * component) resolves its slots — override → Photo dump swap → default — and
 * hands them down through this context, so client components render the same
 * thing <SlotImage> would without importing any server code or the registry.
 */
import { createContext, useContext, type ReactNode } from "react";
import type { ResolvedSlotImage } from "@/lib/image-slot-resolve";

const SlotContext = createContext<Record<string, ResolvedSlotImage>>({});

export function SlotProvider({ slots, children }: { slots: Record<string, ResolvedSlotImage>; children: ReactNode }) {
  return <SlotContext.Provider value={slots}>{children}</SlotContext.Provider>;
}

export type ClientFallback = { src: string; alt: { en: string; es: string }; focus?: string; width?: number; height?: number };

/** A slot rendered from the component's own photo (no provider value). */
export function fallbackSlot(id: string, fb: ClientFallback, sizes = "100vw"): ResolvedSlotImage {
  return {
    slot: id,
    label: id,
    src: fb.src,
    sizes,
    width: fb.width,
    height: fb.height,
    alt: fb.alt,
    objectPosition: fb.focus,
    overridden: false,
    lcp: false,
  };
}

/** Every slot the page resolved. */
export function useSlots(): Record<string, ResolvedSlotImage> {
  return useContext(SlotContext);
}

/** The resolved slot, or `fallback` when the page did not provide one. */
export function useSlot(id: string, fallback: ClientFallback, sizes?: string): ResolvedSlotImage {
  return useContext(SlotContext)[id] ?? fallbackSlot(id, fallback, sizes);
}
