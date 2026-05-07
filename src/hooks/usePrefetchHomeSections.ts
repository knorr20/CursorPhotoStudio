import { useEffect } from 'react';

/**
 * Warm HTTP cache for lazy home-page chunks without mounting sections.
 * Runs after idle (or timeout fallback); skipped when Data Saver is on.
 */
export function usePrefetchHomeSections(): void {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    let prefetched = false;
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const prefetchChunks = () => {
      if (prefetched) return;
      prefetched = true;
      void import('../components/Calendar');
      void import('../components/Contact');
      void import('../components/StudioFeatures');
      void import('../components/TariffSign');
      void import('../components/Equipment');
    };

    const onFirstInteraction = () => prefetchChunks();
    window.addEventListener('scroll', onFirstInteraction, { passive: true });
    window.addEventListener('pointerdown', onFirstInteraction, { passive: true });
    window.addEventListener('touchstart', onFirstInteraction, { passive: true });

    const idle = window.requestIdleCallback;
    if (typeof idle === 'function') {
      idleId = idle(prefetchChunks, { timeout: 2200 });
    } else {
      timerId = window.setTimeout(prefetchChunks, 1600);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
      window.removeEventListener('scroll', onFirstInteraction);
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
    };
  }, []);
}
