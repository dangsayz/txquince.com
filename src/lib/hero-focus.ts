export type HeroFocus = { focusX: number; focusY: number };

/** Keep the subject visible when a portrait is cropped into the wide homepage frame. */
export function resolveHeroFocus(value: { focusX?: number | null; focusY?: number | null }): HeroFocus {
  const valid = (point: number | null | undefined): point is number =>
    typeof point === "number" && Number.isFinite(point) && point >= 0 && point <= 1;
  return {
    focusX: valid(value.focusX) ? value.focusX : 0.5,
    focusY: valid(value.focusY) ? value.focusY : 0.8,
  };
}

export function heroObjectPosition(value: HeroFocus): string {
  return `${Math.round(value.focusX * 100)}% ${Math.round(value.focusY * 100)}%`;
}
