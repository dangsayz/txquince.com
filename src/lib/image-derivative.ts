/** Keep Cloudflare output widths truthful to the custom Next image loader's srcset. */
export const IMAGE_PIPELINE_EPOCH = "3";

export function imageTransformForWidth(width: number) {
  return { width, fit: "scale-down" } as const;
}
