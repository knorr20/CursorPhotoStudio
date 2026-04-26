/**
 * Studio media manifest.
 *
 * To enable a real photo: drop the file at the matching `src` path inside
 * `public/` (so `/studio/interior-1.jpg` lives at `public/studio/interior-1.jpg`)
 * and flip `available` to `true`. Until then, `<StudioImage />` renders a
 * branded placeholder so the layout stays intact.
 */

export type StudioPhoto = {
  src: string;
  alt: string;
  available: boolean;
  caption?: string;
};

export const heroPhoto: StudioPhoto = {
  src: '/studio/hero.jpg',
  alt: 'Inside 23 Photo Studio in North Hollywood',
  available: false,
};

export const interiorPhotos: StudioPhoto[] = [
  {
    src: '/studio/interior-1.png',
    alt: '23 Photo Studio main shooting area with backdrop',
    available: true,
    caption: 'Main shooting area',
  },
  {
    src: '/studio/interior-2.png',
    alt: 'Studio lighting setup with blue backdrop and modifiers at 23 Photo Studio',
    available: true,
    caption: 'Lighting setup with blue backdrop',
  },
  {
    src: '/studio/interior-3.jpg',
    alt: 'Lighting setup with Profoto monolights and softboxes',
    available: false,
    caption: 'Lighting setup',
  },
  {
    src: '/studio/interior-4.jpg',
    alt: 'Makeup and prep area at 23 Photo Studio',
    available: false,
    caption: 'Prep area',
  },
  {
    src: '/studio/interior-5.jpg',
    alt: 'Backdrop storage and color rolls',
    available: false,
    caption: 'Backdrop options',
  },
  {
    src: '/studio/interior-6.jpg',
    alt: 'Studio entrance and reception',
    available: false,
    caption: 'Studio entrance',
  },
];

export const floorPlan: StudioPhoto = {
  src: '/studio/floor-plan.png',
  alt: 'Studio floor plan with dimensions 26 ft 3 in by 22 ft 11 in, 9 ft 10 in height, and 601.3 sq ft total area',
  available: true,
  caption: 'Approx. 601.3 sq ft (26\'3" x 22\'11"), 9\'10" ceilings',
};

export const backstagePhotos: StudioPhoto[] = [
  {
    src: '/studio/backstage-1.jpg',
    alt: 'Photographer working with client at 23 Photo Studio',
    available: false,
  },
  {
    src: '/studio/backstage-2.jpg',
    alt: 'Lighting being adjusted during a shoot',
    available: false,
  },
  {
    src: '/studio/backstage-3.jpg',
    alt: 'Behind the scenes of a portrait session',
    available: false,
  },
  {
    src: '/studio/backstage-4.jpg',
    alt: 'Product shoot in progress at the studio',
    available: false,
  },
  {
    src: '/studio/backstage-5.jpg',
    alt: 'Crew setting up backdrop and lights',
    available: false,
  },
  {
    src: '/studio/backstage-6.jpg',
    alt: 'Reviewing shots on monitor at 23 Photo Studio',
    available: false,
  },
  {
    src: '/studio/backstage-7.jpg',
    alt: 'Fashion shoot lighting setup',
    available: false,
  },
  {
    src: '/studio/backstage-8.jpg',
    alt: 'Behind the scenes of a video production',
    available: false,
  },
  {
    src: '/studio/backstage-9.jpg',
    alt: 'Beauty dish portrait setup',
    available: false,
  },
];
