import type { Metadata } from "next";

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

export const SITE_NAME = "F1 View";

export const DEFAULT_OG_IMAGE = {
  url: "/hero-bg.png",
  width: 1024,
  height: 1024,
  alt: "F1 View - Formula 1 Telemetry & Race Analytics",
};

/** Builds consistent OpenGraph, Twitter, and canonical metadata for sub-routes. */
export function buildPageSocialMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const fullTitle = title.endsWith(`| ${SITE_NAME}`) ? title : `${title} | ${SITE_NAME}`;
  const fullUrl = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: fullUrl,
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

