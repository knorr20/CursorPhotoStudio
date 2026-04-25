import React, { useEffect } from 'react';
import { X, Navigation, MapPin, ExternalLink } from 'lucide-react';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

const DirectionsModal: React.FC<DirectionsModalProps> = ({ isOpen, onClose, address }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const appleMapsUrl = `http://maps.apple.com/?daddr=${encodeURIComponent(address)}`;

  const handleMapChoice = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-label="Get directions">
      <div className="bg-white max-w-md w-full shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-studio-green to-studio-green-darker text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Navigation className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Get Directions</h2>
            <p className="text-white/80 text-sm">Choose your preferred map app</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Address Display */}
          <div className="bg-gray-50 p-4 mb-6">
            <div className="flex flex-col items-center text-center gap-3">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900 mb-1">23 PHOTO STUDIO</div>
                <div className="text-gray-600 text-sm">{address}</div>
              </div>
            </div>
          </div>

          {/* Map Options */}
          <div className="space-y-3">
            <button
              onClick={() => handleMapChoice(googleMapsUrl)}
              className="w-full flex items-center justify-center p-4 bg-white border-2 border-gray-200 hover:border-studio-green/30 hover:bg-studio-green/10 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-studio-green/10 flex items-center justify-center group-hover:bg-studio-green/20 transition-colors duration-200">
                  <svg className="w-6 h-6 text-studio-green" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Google Maps</div>
                  <div className="text-sm text-gray-600">Open in Google Maps</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleMapChoice(appleMapsUrl)}
              className="w-full flex items-center justify-center p-4 bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                  <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Apple Maps</div>
                  <div className="text-sm text-gray-600">Open in Apple Maps</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectionsModal;