import React from 'react';
import { Check } from 'lucide-react';

interface BookingStepsIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const STEPS: { id: 1 | 2 | 3; label: string; shortLabel: string }[] = [
  { id: 1, label: 'Date & Time', shortLabel: 'Date & Time' },
  { id: 2, label: 'Your Details', shortLabel: 'Details' },
  { id: 3, label: 'Payment', shortLabel: 'Payment' },
];

const BookingStepsIndicator: React.FC<BookingStepsIndicatorProps> = ({ currentStep }) => {
  return (
    <ol
      className="mx-auto mt-6 mb-2 flex max-w-2xl items-center justify-center gap-2 sm:gap-3"
      aria-label="Booking progress"
    >
      {STEPS.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isUpcoming = step.id > currentStep;

        const pillBase =
          'flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-heading font-black uppercase tracking-wide transition-colors duration-200 border';
        const pillState = isActive
          ? 'bg-studio-green text-white border-studio-green'
          : isCompleted
          ? 'bg-studio-green/10 text-studio-green border-studio-green/30'
          : 'bg-white text-gray-400 border-gray-200';

        const numberBase =
          'flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-black flex-shrink-0';
        const numberState = isActive
          ? 'bg-white text-studio-green'
          : isCompleted
          ? 'bg-studio-green text-white'
          : 'bg-gray-100 text-gray-400';

        return (
          <React.Fragment key={step.id}>
            <li
              className={`${pillBase} ${pillState}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className={`${numberBase} ${numberState}`}>
                {isCompleted ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : step.id}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.shortLabel}</span>
            </li>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`hidden sm:block h-px w-6 ${
                  isCompleted ? 'bg-studio-green/40' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
};

export default BookingStepsIndicator;
