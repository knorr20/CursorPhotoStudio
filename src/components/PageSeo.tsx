import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULT_OG_IMAGE, SITE_ORIGIN } from '../lib/seoConstants';

export type LinkPreloadConfig = {
  href: string;
  as: 'image' | 'font' | 'style' | 'script' | 'fetch';
  type?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials';
};

export interface PageSeoProps {
  title: string;
  description: string;
  /** Path including leading slash, e.g. `/studio` or `/` */
  canonicalPath: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** Scroll to top on mount (default true). Set false if the parent handles scroll. */
  scrollToTop?: boolean;
  /** Optional LCP or critical asset preloads (home hero JPEG, etc.) */
  linkPreloads?: LinkPreloadConfig[];
}

export function canonicalUrlFromPath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p === '/') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${p}`;
}

/**
 * Per-route SEO: title, description, canonical, robots, Open Graph / Twitter.
 * Use on each top-level route (home layout, legal pages, studio, 404).
 */
export default function PageSeo({
  title,
  description,
  canonicalPath,
  robots = 'index, follow',
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  scrollToTop = true,
  linkPreloads,
}: PageSeoProps) {
  useEffect(() => {
    if (scrollToTop) window.scrollTo(0, 0);
  }, [scrollToTop, title, canonicalPath]);

  const canonical = canonicalUrlFromPath(canonicalPath);
  const ogT = ogTitle ?? title;
  const ogD = ogDescription ?? description;

  return (
    <Helmet prioritizeDefaultTitle>
      {linkPreloads?.map((l, i) => (
        <link
          key={`${l.href}-${i}`}
          rel="preload"
          href={l.href}
          as={l.as}
          type={l.type}
          fetchPriority={l.fetchPriority}
          crossOrigin={l.crossOrigin}
        />
      ))}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robots} />
      <meta property="og:title" content={ogT} />
      <meta property="og:description" content={ogD} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogT} />
      <meta name="twitter:description" content={ogD} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
