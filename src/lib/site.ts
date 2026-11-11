const DEFAULT_SITE_URL = "https://f1-view.vercel.app";

function normalizeSiteUrl(rawUrl?: string): string {
  const trimmed = rawUrl?.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }
  const withProtocol =
    trimmed.startsWith("https://") || trimmed.startsWith("http://")
      ? trimmed
      : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

/** Canonical base URL used for SEO metadata, sitemap, and robots routes. */
export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
);

