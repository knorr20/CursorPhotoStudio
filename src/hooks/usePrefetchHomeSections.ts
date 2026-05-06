import { useEffect } from 'react';

/**
 * Warm HTTP cache for lazy home-page chunks without mounting sections.
 * Runs after idle (or timeout fallback); skipped when Data Saver is on.
 */
export function usePrefetchHomeSections(): void {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const prefetchChunks = () => {
      void import('../components/StudioFeatures');
      void import('../components/TariffSign');
      void import('../components/Equipment');
      void import('../components/Calendar');
      void import('../components/Contact');
    };

    const idle = window.requestIdleCallback;
    if (typeof idle === 'function') {
      const id = idle(prefetchChunks, { timeout: 3500 });
      return () => window.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(prefetchChunks, 2500);
    return () => window.clearTimeout(timer);
  }, []);
}
