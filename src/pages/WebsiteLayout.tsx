import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import StudioFeatures from '../components/StudioFeatures';
import Equipment from '../components/Equipment';
import TariffSign from '../components/TariffSign';
import Calendar from '../components/Calendar';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { Booking } from '../types/booking';

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
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigateAndScroll={onNavigateAndScroll} />
      <main id="main-content">
        <Hero />
        <StudioFeatures />
        <TariffSign />
        <Equipment />
        <Calendar
          bookings={bookings}
          onBookingFinalized={onBookingFinalized}
          stripePublishableKey={stripePublishableKey}
        />
        <Contact />
      </main>
      <Footer onNavigateAndScroll={onNavigateAndScroll} />
    </div>
  );
};

export default WebsiteLayout;
