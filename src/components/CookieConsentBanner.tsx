import React from 'react';
import { Link } from 'react-router-dom';
import type { CookieNoticeState } from '../lib/consent';

interface CookieConsentBannerProps {
  onSave: (state: CookieNoticeState) => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onSave }) => {
  const now = () => new Date().toISOString();

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] border-t border-slate-200 bg-white/95 backdrop-blur shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          We use standard tools to run online booking, secure payments, and guest messaging—same as most professional
          studio sites. Details are in our{' '}
          <Link to="/privacy" className="underline font-medium text-studio-green hover:text-studio-green-darker">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSave({ preset: 'essential', updatedAt: now() })}
            className="px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => onSave({ preset: 'all', updatedAt: now() })}
            className="px-4 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-700"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => onSave({ preset: 'dismissed', updatedAt: now() })}
            className="px-4 py-2.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
