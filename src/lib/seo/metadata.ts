/**
 * SEO metadata helpers.
 *
 * Use these to build consistent metadata across all pages.
 */

import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageSeoOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * Build page-level metadata that inherits site-wide defaults.
 */
export function buildPageMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: PageSeoOptions = {}): Metadata {
  const pageTitle = title
    ? siteConfig.seo.titleTemplate.replace("%s", title)
    : siteConfig.seo.defaultTitle;

  const pageDescription = description || siteConfig.description;
  const canonicalUrl = `${siteConfig.url}${path}`;

  return {
    title: pageTitle,
    description: pageDescription,
    ...(noIndex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: siteConfig.seo.openGraph.siteName,
      type: siteConfig.seo.openGraph.type,
      locale: siteConfig.seo.openGraph.locale,
      images: [
        {
          url: image || siteConfig.logo,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: siteConfig.seo.twitter.cardType,
      title: pageTitle,
      description: pageDescription,
      images: [image || siteConfig.logo],
    },
  };
}
