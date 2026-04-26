import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MobileBookingBarProps {
  dateLabel: string;
  timeLabel: string | null;
  priceTotal: number;
  disabled: boolean;
  disabledReason: string;
  agreedToTerms: boolean;
  termsMissing: boolean;
  onContinue: () => void;
}

const MobileBookingBar: React.FC<MobileBookingBarProps> = ({
  dateLabel,
  timeLabel,
  priceTotal,
  disabled,
  disabledReason,
  agreedToTerms,
  termsMissing,
  onContinue,
}) => {
  const buttonClasses = disabled
    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
    : agreedToTerms
    ? 'bg-studio-green hover:bg-studio-green-darker text-white'
    : 'bg-yellow-500 hover:bg-yellow-600 text-white';

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 shadow-2xl px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]"
      role="region"
      aria-label="Booking summary"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider text-gray-500 font-heading font-black truncate">
            {dateLabel}
          </div>
          <div className="text-sm font-heading font-black text-gray-900 truncate">
            {timeLabel ? timeLabel : 'Pick a time'}
          </div>
          {priceTotal > 0 && (
            <div className="text-base font-heading font-black text-studio-green leading-tight">
              ${priceTotal}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          aria-label={disabled ? disabledReason : 'Continue to booking details'}
          className={`flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] font-heading font-black uppercase text-sm transition-colors duration-200 flex-shrink-0 ${buttonClasses}`}
        >
          <span>{termsMissing ? 'Agree & continue' : 'Continue'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {!disabled && termsMissing && (
        <div className="mt-1 text-[11px] text-amber-700 text-center truncate">
          Accept terms to continue
        </div>
      )}
      {disabled && disabledReason && (
        <div className="mt-1 text-[11px] text-gray-500 text-center truncate">
          {disabledReason}
        </div>
      )}
    </div>
  );
};

export default MobileBookingBar;
