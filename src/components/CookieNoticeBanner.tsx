import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { CookieNoticeChoice } from '../lib/cookieNotice';
import { saveCookieNotice } from '../lib/cookieNotice';

interface CookieNoticeBannerProps {
  onChoose: (choice: CookieNoticeChoice) => void;
}

/**
 * Cosmetic CMP-style banner only: choice is stored for UX / disclosure;
 * it does not gate scripts or third-party widgets.
 */
const CookieNoticeBanner: React.FC<CookieNoticeBannerProps> = ({ onChoose }) => {
  const handle = (choice: CookieNoticeChoice) => {
    saveCookieNotice(choice);
    onChoose(choice);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-gray-200 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      role="dialog"
      aria-label="Cookie notice"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 text-sm text-gray-700 leading-relaxed pr-2">
          <p className="font-semibold text-gray-900 mb-1">Cookies &amp; privacy</p>
          <p>
            We use cookies and similar tech to run this site, bookings, payments, and embedded tools (e.g. chat).
            By continuing you acknowledge our{' '}
            <Link to="/privacy" className="text-studio-green hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:flex-nowrap sm:shrink-0">
          <button
            type="button"
            onClick={() => handle('all')}
            className="px-4 py-2.5 text-sm font-heading font-bold uppercase bg-studio-green text-white hover:bg-studio-green-darker transition-colors"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => handle('essential')}
            className="px-4 py-2.5 text-sm font-heading font-bold uppercase border-2 border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => handle('dismissed')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieNoticeBanner;
