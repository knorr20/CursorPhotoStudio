import React from 'react';
import { Camera, Maximize2 } from 'lucide-react';
import type { StudioPhoto } from '../../data/studioMedia';

type AspectRatio = 'square' | 'video' | 'portrait' | 'wide' | 'landscape';

interface StudioImageProps {
  photo: StudioPhoto;
  aspect?: AspectRatio;
  /** `cover` crops to fill the frame; `contain` shows the full image (letterboxing as needed). */
  objectFit?: 'cover' | 'contain';
  onClick?: () => void;
  className?: string;
  priority?: boolean;
}

const aspectClass: Record<AspectRatio, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[4/5]',
  wide: 'aspect-[16/7]',
  landscape: 'aspect-[3/2]',
};

const StudioImage: React.FC<StudioImageProps> = ({
  photo,
  aspect = 'video',
  objectFit = 'cover',
  onClick,
  className = '',
  priority = false,
}) => {
  const interactive = Boolean(onClick) && photo.available;
  const baseClass = `relative w-full ${aspectClass[aspect]} overflow-hidden bg-gray-100 ${className}`;
  const interactiveClass = interactive
    ? 'cursor-zoom-in group'
    : '';
  const imgObjectClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';
  const imgHoverClass = interactive
    ? 'transition-transform duration-500 group-hover:scale-105'
    : '';

  if (!photo.available) {
    return (
      <div
        className={`${baseClass} flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 border border-gray-200`}
        role="img"
        aria-label={`${photo.alt} (placeholder — photo coming soon)`}
      >
        <Camera className="h-10 w-10 mb-2 text-gray-300" aria-hidden="true" />
        <div className="text-xs uppercase tracking-wider font-heading font-black text-gray-400">
          Photo coming soon
        </div>
        {photo.caption && (
          <div className="text-xs text-gray-400 mt-1 px-3 text-center">
            {photo.caption}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`${baseClass} ${interactiveClass} block text-left p-0 border-0`}
      aria-label={interactive ? `Open larger view: ${photo.alt}` : photo.alt}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full h-full ${imgObjectClass} ${imgHoverClass}`}
      />
      {interactive && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      )}
      {photo.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs sm:text-sm font-heading font-black uppercase tracking-wide px-3 py-2">
          {photo.caption}
        </div>
      )}
    </button>
  );
};

export default StudioImage;
