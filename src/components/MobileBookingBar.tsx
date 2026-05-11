import React from 'react';
import { ArrowRight } from 'lucide-react';

export type MobileBookingPhase = 'need_date' | 'need_time' | 'need_terms' | 'ready';

interface MobileBookingBarProps {
  phase: MobileBookingPhase;
  dateLine: string;
  timeLine: string;
  priceTotal: number;
  /** Optional line under the row (e.g. time selection or terms hint). */
  bottomHint?: string | null;
  primaryAriaLabel: string;
  onPrimary: () => void;
}

const PRIMARY_LABELS: Record<MobileBookingPhase, string> = {
  need_date: 'Choose date',
  need_time: 'Pick times',
  need_terms: 'Agree & continue',
  ready: 'Continue',
};

const MobileBookingBar: React.FC<MobileBookingBarProps> = ({
  phase,
  dateLine,
  timeLine,
  priceTotal,
  bottomHint,
  primaryAriaLabel,
  onPrimary,
}) => {
  const isNavigationOnly = phase === 'need_date' || phase === 'need_time';
  const buttonClasses = isNavigationOnly
    ? 'bg-studio-green hover:bg-studio-green-darker text-white'
    : phase === 'need_terms'
      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
      : 'bg-studio-green hover:bg-studio-green-darker text-white';

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-2xl px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]"
      role="region"
      aria-label="Booking assistant"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider text-gray-500 font-heading font-black truncate">
            {dateLine}
          </div>
          <div className="text-sm font-heading font-black text-gray-900 truncate">{timeLine}</div>
          {priceTotal > 0 && (
            <div className="text-base font-heading font-black text-studio-green leading-tight">${priceTotal}</div>
          )}
        </div>
        <button
          type="button"
          onClick={onPrimary}
          aria-label={primaryAriaLabel}
          className={`flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] font-heading font-black uppercase text-sm transition-colors duration-200 flex-shrink-0 ${buttonClasses}`}
        >
          <span>{PRIMARY_LABELS[phase]}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {bottomHint ? (
        <div className="mt-1 text-[11px] text-gray-500 text-center truncate">{bottomHint}</div>
      ) : null}
    </div>
  );
};

export default MobileBookingBar;
