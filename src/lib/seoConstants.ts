/** Must stay aligned with index.html defaults for the home page. */
export const SITE_ORIGIN = 'https://23photostudio.com';

export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/23photostudio.jpg`;

export const HOME_PAGE_SEO = {
  title: '23 Photo Studio - Photo Studio Rental in North Hollywood | Online Booking',
  description:
    'Rent a fully equipped photo and video studio in North Hollywood with professional Profoto lighting equipment. Best price-to-quality ratio in Los Angeles. Flexible hours, safe location, includes D2 500Ws monolights, beauty dish, softboxes. Book your studio time today!',
  canonicalPath: '/',
  /** Shorter OG title matches index.html og:title */
  ogTitle: '23 Photo Studio - Photo Studio Rental in North Hollywood',
  ogDescription:
    'Rent a fully equipped photo and video studio in North Hollywood with professional Profoto lighting equipment. Best price-to-quality ratio in Los Angeles.',
} as const;
