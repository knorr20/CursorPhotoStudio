/**
 * Studio media manifest.
 *
 * To enable a real photo: drop the file at the matching `src` path inside
 * `public/` (so `/studio/interior-1.png` lives at `public/studio/interior-1.png`)
 * and flip `available` to `true`. Until then, `<StudioImage />` renders a
 * branded placeholder so the layout stays intact.
 */

export type StudioPhoto = {
  src: string;
  alt: string;
  available: boolean;
  caption?: string;
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
    alt: 'Backdrop stand zone with rollers and modifiers at 23 Photo Studio',
    available: true,
    caption: 'Dedicated backdrop stand area',
  },
  {
    src: '/studio/interior-3.png',
    alt: 'Artistic textured backdrops with professional lighting setup at 23 Photo Studio',
    available: true,
    caption: 'Artistic backdrop setup',
  },
  {
    src: '/studio/interior-4.png',
    alt: 'Wide interior view of 23 Photo Studio from another angle',
    available: true,
    caption: 'Another angle of the space',
  },
  {
    src: '/studio/interior-5.png',
    alt: 'Studio interior with gallery wall, mirror, and equipment at 23 Photo Studio',
    available: true,
    caption: 'Gallery wall area',
  },
  {
    src: '/studio/interior-6.png',
    alt: 'On-site restroom with neon decor used as an optional creative set at 23 Photo Studio',
    available: true,
    caption: 'On-site restroom (creative set)',
  },
];

export const floorPlan: StudioPhoto = {
  src: '/studio/floor-plan.png',
  alt: 'Studio floor plan with dimensions 26 ft 3 in by 22 ft 11 in, 9 ft 10 in height, and 601.3 sq ft total area',
  available: true,
};

export const backstagePhotos: StudioPhoto[] = [
  {
    src: '/studio/backstage-1.jpg',
    alt: 'Photographer working with client at 23 Photo Studio',
    available: true,
    caption: 'Portrait setup in studio',
  },
  {
    src: '/studio/backstage-2.jpg',
    alt: 'Lighting being adjusted during a shoot',
    available: true,
    caption: 'Black and white fashion portrait',
  },
  {
    src: '/studio/backstage-3.jpg',
    alt: 'Behind the scenes of a portrait session',
    available: true,
    caption: 'Creative red-light setup',
  },
  {
    src: '/studio/backstage-4.jpg',
    alt: 'Product shoot in progress at the studio',
    available: true,
    caption: 'Moody editorial pose',
  },
  {
    src: '/studio/backstage-5.jpg',
    alt: 'Crew setting up backdrop and lights',
    available: true,
    caption: 'Color gel portrait look',
  },
  {
    src: '/studio/backstage-6.jpg',
    alt: 'Reviewing shots on monitor at 23 Photo Studio',
    available: true,
    caption: 'Film-style monochrome portrait',
  },
  {
    src: '/studio/studio-action-07.jpg',
    alt: 'Fashion shoot lighting setup',
    available: true,
    caption: 'Sunlight sculpted portrait',
  },
  {
    src: '/studio/studio-action-08.jpg',
    alt: 'Behind the scenes of a video production',
    available: true,
    caption: 'Dynamic floor pose session',
  },
  {
    src: '/studio/studio-action-09.jpg',
    alt: 'Beauty dish portrait setup',
    available: true,
    caption: 'Warm cinematic close-up',
  },
  {
    src: '/studio/studio-action-10.jpg',
    alt: 'Model reclining under directional studio light at 23 Photo Studio',
    available: true,
    caption: 'Directional light composition',
  },
  {
    src: '/studio/studio-action-11.jpg',
    alt: 'Editorial red-light fashion portrait in studio',
    available: true,
    caption: 'Red editorial styling',
  },
  {
    src: '/studio/studio-action-12.jpg',
    alt: 'Stylized winter sports set with artificial snow',
    available: true,
    caption: 'Custom set with practical effects',
  },
  {
    src: '/studio/studio-action-13.jpg',
    alt: 'Monochrome seated male portrait at 23 Photo Studio',
    available: true,
    caption: 'Classic monochrome portrait',
  },
  {
    src: '/studio/studio-action-14.jpg',
    alt: 'Black and white automotive mood portrait in garage setting',
    available: true,
    caption: 'Automotive mood portrait',
  },
  {
    src: '/studio/studio-action-15.jpg',
    alt: 'Blue and red gel close-up portrait',
    available: true,
    caption: 'Color gel close-up',
  },
  {
    src: '/studio/studio-action-16.jpg',
    alt: 'Black and white cigar portrait in dramatic light',
    available: true,
    caption: 'Dramatic black and white look',
  },
  {
    src: '/studio/studio-action-17.jpg',
    alt: 'Grainy monochrome editorial portrait on chair',
    available: true,
    caption: 'Textured editorial portrait',
  },
];
