type PhotoDimensions = { width: number | null; height: number | null };

export function hasFullBleedResolution(photo: PhotoDimensions): boolean {
  return photo.width !== null && photo.width >= 1920 && photo.height !== null && photo.height >= 1080;
}

export function selectFullBleedPhoto<T extends PhotoDimensions>(photos: readonly T[], index = 0): T | null {
  const suitable = photos.filter(hasFullBleedResolution);
  return suitable[index] ?? suitable[0] ?? null;
}
