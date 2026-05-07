import React, { useEffect, useRef, useState } from 'react';

type DeferredSectionProps = {
  children: React.ReactNode;
  /** Start loading before the section enters viewport. */
  rootMargin?: string;
  /** Placeholder min-height to reduce layout jumps before mount. */
  minHeightClassName?: string;
  /** Optional accessible helper text shown while section is deferred. */
  placeholderText?: string;
};

const DeferredSection: React.FC<DeferredSectionProps> = ({
  children,
  rootMargin = '320px',
  minHeightClassName = 'min-h-[220px]',
  placeholderText = 'Loading section',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible) return;
    const node = anchorRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={anchorRef}>
      {isVisible ? (
        children
      ) : (
        <div
          className={`${minHeightClassName} rounded-md border border-gray-100 bg-gray-50`}
          role="status"
          aria-live="polite"
          aria-label={placeholderText}
        />
      )}
    </div>
  );
};

export default DeferredSection;
