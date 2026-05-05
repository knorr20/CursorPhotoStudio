import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConsentPreferences, getDefaultConsent } from '../lib/consent';

interface CookieConsentBannerProps {
  onSave: (prefs: ConsentPreferences) => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onSave }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    const base = getDefaultConsent();
    onSave({
      ...base,
      analytics: next.analytics,
      marketing: next.marketing,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <p className="text-sm text-slate-700">
          We use essential cookies for booking and optional cookies for analytics/marketing. Manage your choices any
          time in this banner. See <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>

        {showAdvanced && (
          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked disabled />
              Essential cookies (always on)
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              Analytics cookies
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              Marketing cookies
            </label>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save({ analytics: false, marketing: false })}
            className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: true, marketing: true })}
            className="px-3 py-2 text-sm bg-slate-900 text-white rounded hover:bg-slate-700"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50"
          >
            {showAdvanced ? 'Hide settings' : 'Customize'}
          </button>
          {showAdvanced && (
            <button
              type="button"
              onClick={() => save({ analytics, marketing })}
              className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50"
            >
              Save choices
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
