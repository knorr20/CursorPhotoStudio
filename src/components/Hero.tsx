import React, { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import DirectionsModal from './DirectionsModal';

const heroPosterJpeg = '/zaglushka-hero.jpg';
const heroPosterPng = '/zaglushka.png';

const Hero = () => {
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const heroPrefs = useMemo(() => {
    if (typeof window === 'undefined') {
      return { deferHeroVideo: false, startWithVideo: false };
    }
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const reducedData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const deferHeroVideo = mobile || !!reducedData;
    return { deferHeroVideo, startWithVideo: !deferHeroVideo };
  }, []);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(heroPrefs.startWithVideo);

  const studioAddress = '10710 BURBANK BLVD, NORTH HOLLYWOOD, CA 91601';

  const heroStill = (
    <picture>
      <source srcSet={heroPosterJpeg} type="image/jpeg" />
      <img
        src={heroPosterPng}
        alt="23 Photo Studio"
        className="absolute inset-0 w-full h-full object-cover z-0"
        fetchPriority="high"
        decoding="async"
        width={486}
        height={274}
      />
    </picture>
  );

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gray-700">
      {shouldLoadVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={heroPosterJpeg}
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/web4.mp4" media="(max-width: 767px)" type="video/mp4" />
          <source src="/web5.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        heroStill
      )}

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-5"></div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-8xl font-heading font-black text-white mb-6 leading-tight uppercase text-balance">
          RENT A FULLY EQUIPPED
          <span className="block text-gray-300 font-heading">PHOTO STUDIO</span>
        </h1>

        <button
          onClick={() => setShowDirectionsModal(true)}
          className="flex items-center justify-center gap-2 text-sm text-white mb-8 hover:text-rich-yellow transition-colors duration-200 cursor-pointer underline decoration-1 underline-offset-2 hover:decoration-rich-yellow mx-auto"
        >
          <MapPin className="h-4 w-4" />
          <span className="uppercase">Located in the heart of North Hollywood</span>
        </button>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            className="group bg-studio-green text-white px-8 py-3 font-heading font-black text-lg hover:bg-studio-green-darker transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase w-full sm:w-auto min-w-[200px]"
          >
            BOOK STUDIO TIME
          </button>

          <button
            onClick={() => document.getElementById('equipment')?.scrollIntoView({ behavior: 'smooth' })}
            className="group bg-white/10 backdrop-blur-sm border border-white/40 text-white px-8 py-3 font-heading font-black text-lg hover:bg-white/20 hover:border-white/60 transition-all duration-300 flex items-center justify-center gap-2 uppercase w-full sm:w-auto min-w-[200px]"
          >
            VIEW EQUIPMENT
          </button>
        </div>
      </div>

      {heroPrefs.deferHeroVideo && !shouldLoadVideo && (
        <div className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 sm:bottom-28">
          <button
            type="button"
            onClick={() => setShouldLoadVideo(true)}
            className="text-center text-xs font-heading font-bold uppercase tracking-wide text-white/90 underline decoration-white/50 underline-offset-4 transition-colors hover:text-rich-yellow hover:decoration-rich-yellow"
          >
            Play background video
          </button>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white animate-bounce">
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/50">
          <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-white/50" />
        </div>
      </div>

      {/* Directions Modal */}
      <DirectionsModal
        isOpen={showDirectionsModal}
        onClose={() => setShowDirectionsModal(false)}
        address={studioAddress}
      />
    </section>
  );
};

export default Hero;
