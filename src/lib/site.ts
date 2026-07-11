// Fictional brand, so the fallback domain matches the fictional contact
// email already used in the footer. Override via env once a real domain
// is wired up.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenoir.vn").replace(
  /\/$/,
  "",
);
