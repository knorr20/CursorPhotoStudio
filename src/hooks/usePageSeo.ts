/**
 * Route-level SEO helpers (react-helmet-async).
 * Prefer using `<PageSeo />` from `../components/PageSeo` on each page.
 */
export { default as PageSeo } from '../components/PageSeo';
export type { PageSeoProps } from '../components/PageSeo';
export { canonicalUrlFromPath } from '../components/PageSeo';
export {
  SITE_ORIGIN,
  DEFAULT_OG_IMAGE,
  HOME_PAGE_SEO,
} from '../lib/seoConstants';
