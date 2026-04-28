import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Brush,
  Car,
  Layers2,
  Package,
  PlayCircle,
  Snowflake,
  Wifi,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StudioImage from '../components/studio/StudioImage';
import StudioLightbox from '../components/studio/StudioLightbox';
import {
  interiorPhotos,
  floorPlan,
  backstagePhotos,
} from '../data/studioMedia';

interface StudioPageProps {
  onNavigateAndScroll: (sectionId: string) => void;
}

const QUICK_SPECS: { icon: React.ReactNode; label: string; value: string }[] = [
  {
    icon: <Car className="h-6 w-6" />,
    label: 'Parking',
    value: 'Free curb parking on a quiet residential block — spots are usually easy.',
  },
  {
    icon: <Brush className="h-6 w-6" />,
    label: 'Makeup area',
    value: 'Portable station — we place it wherever works best for your set.',
  },
  {
    icon: <Layers2 className="h-6 w-6" />,
    label: 'Backdrops',
    value: 'Seamless paper in classic colors plus exclusive artistic options.',
  },
  {
    icon: <Snowflake className="h-6 w-6" />,
    label: 'Climate (A/C)',
    value: 'Strong A/C — stay comfortable when lights, gear, and crew add heat.',
  },
  {
    icon: <Wifi className="h-6 w-6" />,
    label: 'Wi-Fi',
    value: 'High-speed included for cast & crew.',
  },
  {
    icon: <Package className="h-6 w-6" />,
    label: 'More gear (on site)',
    value: 'Extra lights, photo & video gear to add on site — in-house, no extra rental run.',
  },
];

const StudioPage: React.FC<StudioPageProps> = ({ onNavigateAndScroll }) => {
  const [interiorIndex, setInteriorIndex] = useState<number | null>(null);
  const [backstageIndex, setBackstageIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Studio tour | 23 Photo Studio North Hollywood';

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const setCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = href;
    };

    setMeta(
      'description',
      'Studio tour of 23 Photo Studio in North Hollywood — interior photos, floor plan, space specs, behind-the-scenes stills, and a walkthrough video.'
    );
    setCanonical('https://23photostudio.com/studio');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigateAndScroll={onNavigateAndScroll} />

      <main id="main-content">
        {/* 1. Page header (compact, no full-bleed hero / placeholder) */}
        <section className="pt-24 pb-8 sm:pb-10 bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-900 mb-3 font-medium tracking-wide transition-colors duration-200"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" aria-hidden="true" />
              <span className="border-b border-transparent hover:border-gray-300 pb-px transition-[border-color] duration-200">
                Back to home
              </span>
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black uppercase mb-3 text-balance text-gray-900">
              Studio tour
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Take a walk through our space — gear, layout, and the kind of work we host every day in North Hollywood.
            </p>
          </div>
        </section>

        {/* 2. Studio Gallery */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 uppercase mb-3">
                The Space
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Tap any photo to open it full size.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {interiorPhotos.map((photo, idx) => (
                <StudioImage
                  key={photo.src}
                  photo={photo}
                  aspect="landscape"
                  onClick={() => setInteriorIndex(idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 3. Floor Plan */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 uppercase mb-3">
                Floor Plan
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                26'3" x 22'11" · 601.3 sq ft total area · 9'10" ceilings.
              </p>
            </div>
            <div className="bg-white shadow-xl p-4 sm:p-6">
              <StudioImage
                photo={floorPlan}
                aspect="video"
                objectFit="contain"
                className="bg-white"
              />
            </div>
          </div>
        </section>

        {/* 4. Quick Specs */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 uppercase mb-3">
                Quick Specs
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {QUICK_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="bg-gray-50 p-5 text-center border border-gray-100 hover:border-studio-green/30 transition-colors duration-200"
                >
                  <div className="flex justify-center text-studio-green mb-3">
                    {spec.icon}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-heading font-black">
                    {spec.label}
                  </div>
                  <div className="text-xs sm:text-sm leading-snug font-heading font-black text-gray-900 mt-1">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. In Action / Backstage */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 uppercase mb-3">
                Studio in Action
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Real shoots, real crews. Here is what a working day looks like.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {backstagePhotos.map((photo, idx) => (
                <StudioImage
                  key={photo.src}
                  photo={photo}
                  aspect="portrait"
                  onClick={() => setBackstageIndex(idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 6. Video Reel */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-studio-green font-heading font-black mb-2">
                <PlayCircle className="h-4 w-4" /> Studio reel
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 uppercase">
                See the studio on video
              </h2>
            </div>
            <div className="bg-black shadow-xl overflow-hidden max-w-sm sm:max-w-md md:max-w-lg mx-auto aspect-[9/16] relative">
              <iframe
                src="https://player.vimeo.com/video/1187162215?autopause=0&loop=1&title=0&byline=0&portrait=0&badge=0&dnt=1"
                className="absolute top-0 left-0 w-full h-full"
                loading="lazy"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                title="23 Photo Studio North Hollywood Burbank"
              />
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="py-16 bg-studio-green text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase mb-4">
              Ready to shoot here?
            </h2>
            <p className="text-white/85 mb-8 max-w-2xl mx-auto">
              Pick a date, lock in your time, and the studio is yours. Booking takes about a minute.
            </p>
            <Link
              to="/"
              onClick={() => setTimeout(() => onNavigateAndScroll('booking'), 50)}
              className="inline-flex items-center gap-2 bg-rich-yellow text-gray-900 px-8 py-4 font-heading font-black uppercase text-lg hover:bg-yellow-400 transition-colors duration-200 shadow-lg"
            >
              Book Studio Time
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer onNavigateAndScroll={onNavigateAndScroll} />

      <StudioLightbox
        photos={interiorPhotos}
        index={interiorIndex}
        onClose={() => setInteriorIndex(null)}
        onNavigate={setInteriorIndex}
      />
      <StudioLightbox
        photos={backstagePhotos}
        index={backstageIndex}
        onClose={() => setBackstageIndex(null)}
        onNavigate={setBackstageIndex}
      />
    </div>
  );
};

export default StudioPage;
