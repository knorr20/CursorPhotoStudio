import React, { useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StudioPhoto } from '../../data/studioMedia';

interface StudioLightboxProps {
  photos: StudioPhoto[];
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

const StudioLightbox: React.FC<StudioLightboxProps> = ({
  photos,
  index,
  onClose,
  onNavigate,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  const isOpen = index !== null && index >= 0 && index < photos.length;
  const total = photos.length;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + total) % total);
  }, [index, total, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % total);
  }, [index, total, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen || index === null) return null;

  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        aria-label="Close image"
      >
        <X className="h-7 w-7" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-black/30 hover:bg-black/50 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-black/30 hover:bg-black/50 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      <figure
        className="max-w-6xl w-full max-h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-h-[80vh] max-w-full object-contain shadow-2xl"
        />
        <figcaption className="text-white/80 text-sm text-center mt-3 px-2">
          {photo.caption || photo.alt}
          {total > 1 && (
            <span className="ml-2 text-white/50">· {index + 1} of {total}</span>
          )}
        </figcaption>
      </figure>
    </div>
  );
};

export default StudioLightbox;
