import React, { Suspense, lazy } from 'react';
import PageSeo from '../components/PageSeo';
import { HOME_PAGE_SEO } from '../lib/seoConstants';
import Header from '../components/Header';
import Hero from '../components/Hero';
import DeferredSection from '../components/DeferredSection';
import Footer from '../components/Footer';
import { usePrefetchHomeSections } from '../hooks/usePrefetchHomeSections';
import { Booking } from '../types/booking';

const StudioFeatures = lazy(() => import('../components/StudioFeatures'));
const TariffSign = lazy(() => import('../components/TariffSign'));
const Equipment = lazy(() => import('../components/Equipment'));
const Calendar = lazy(() => import('../components/Calendar'));
const Contact = lazy(() => import('../components/Contact'));

interface WebsiteLayoutProps {
  bookings: Booking[];
  onBookingFinalized: () => Promise<void>;
  stripePublishableKey: string;
  onNavigateAndScroll: (sectionId: string) => void;
}

const WebsiteLayout: React.FC<WebsiteLayoutProps> = ({
  bookings,
  onBookingFinalized,
  stripePublishableKey,
  onNavigateAndScroll,
}) => {
  usePrefetchHomeSections();

  const deferredFallback = <div className="min-h-[220px] animate-pulse rounded-md bg-gray-100" aria-hidden="true" />;

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-0">
      <PageSeo
        title={HOME_PAGE_SEO.title}
        description={HOME_PAGE_SEO.description}
        canonicalPath={HOME_PAGE_SEO.canonicalPath}
        ogTitle={HOME_PAGE_SEO.ogTitle}
        ogDescription={HOME_PAGE_SEO.ogDescription}
        linkPreloads={[
          {
            href: '/zaglushka-hero.jpg',
            as: 'image',
            type: 'image/jpeg',
            fetchPriority: 'high',
          },
        ]}
      />
      <Header onNavigateAndScroll={onNavigateAndScroll} />
      <main id="main-content">
        <Hero />
        <Suspense fallback={deferredFallback}>
          <StudioFeatures />
        </Suspense>
        <Suspense fallback={deferredFallback}>
          <TariffSign />
        </Suspense>
        <Suspense fallback={deferredFallback}>
          <Equipment />
        </Suspense>
        <DeferredSection
          rootMargin="720px"
          minHeightClassName="min-h-[720px]"
          placeholderText="Loading calendar"
          eagerOnNarrowViewport
        >
          <Suspense fallback={deferredFallback}>
            <Calendar
              bookings={bookings}
              onBookingFinalized={onBookingFinalized}
              stripePublishableKey={stripePublishableKey}
            />
          </Suspense>
        </DeferredSection>
        <Suspense fallback={<div className="min-h-[420px] animate-pulse rounded-md bg-gray-100" aria-hidden="true" />}>
          <Contact />
        </Suspense>
      </main>
      <Footer onNavigateAndScroll={onNavigateAndScroll} />
    </div>
  );
};

export default WebsiteLayout;
