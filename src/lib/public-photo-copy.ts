type PhotoCopyInput = {
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  city?: string | null;
};

function writtenCopy(value: string | null | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;

  const filenameToken = /(?:^|[\s._-])(?:12img|jpe?g|png|webp|heic|avif)(?=$|[\s._-])/i;
  const cameraName = /(?:^|[\s._-])(?:img|image|dsc|dscf|pxl|pict)[\s._-]?\d{3,}(?=$|[\s._-])/i;
  const numberedPhoto = /(?:^|[\s._-])(?:photo|quince)[\s._-]+\d{3,}(?=$|[\s._-])/i;
  const fileExtension = /\.(?:jpe?g|png|webp|heic|avif)(?=$|[\s._-])/i;
  const numberedQuince = /\bquincea(?:ñ|n|\s)?era[\s._-]*\d{2,3}\b/i;
  const opaqueId = /^(?:[a-f0-9]{8}[-\s][a-f0-9]{4}[-\s][a-f0-9]{4}[-\s][a-f0-9]{4}[-\s][a-f0-9]{12}|[a-f0-9]{32})$/i;

  return filenameToken.test(text) || cameraName.test(text) || numberedPhoto.test(text) || fileExtension.test(text) || numberedQuince.test(text) || opaqueId.test(text)
    ? null
    : text;
}

export function publicPhotoCopy(image: PhotoCopyInput, categoryDescription: string) {
  const city = image.city?.trim();
  const fallback = city ? `${categoryDescription} in ${city}` : categoryDescription;
  const alt = writtenCopy(image.alt) || fallback;
  return {
    title: writtenCopy(image.title) || writtenCopy(image.alt) || fallback,
    alt,
    description: writtenCopy(image.caption) || alt,
  };
}
