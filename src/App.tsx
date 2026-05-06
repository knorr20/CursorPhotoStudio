import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import WebsiteLayout from './pages/WebsiteLayout';
import AdminLoginCard from './components/AdminLoginCard';

const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminBookingsPage = lazy(() => import('./pages/AdminBookingsPage'));
import ErrorBoundary from './components/ErrorBoundary';
import CookieNoticeBanner from './components/CookieNoticeBanner';
import { useBookings } from './hooks/useBookings';
import { useContactMessages } from './hooks/useContactMessages';
import { supabase } from './lib/supabase';
import { loadCookieNotice, type CookieNoticeChoice } from './lib/cookieNotice';
import { Helmet } from 'react-helmet-async';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<Session | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  
  const STRIPE_PUBLISHABLE_KEY = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) ?? '';

  const [cookieNoticeChoice, setCookieNoticeChoice] = useState<CookieNoticeChoice | null>(() =>
    loadCookieNotice()
  );
  const showCookieBanner = cookieNoticeChoice === null && location.pathname !== '/admin';

  // Use the Supabase hook for bookings
  const {
    bookings,
    loading,
    error,
    clearError,
    refetch: refetchBookings,
  } = useBookings();

  const {
    contactMessages,
    loading: messagesLoading,
    error: messagesError,
    clearError: clearMessagesError,
    refetch: refetchMessages,
    updateContactMessageStatus,
    deleteContactMessage,
  } = useContactMessages();

  // Handle navigation and scrolling to sections
  const handleNavigateAndScroll = (sectionId: string) => {
    if (location.pathname === '/') {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page first, then scroll
      setPendingScrollTarget(sectionId);
      navigate('/');
    }
  };

  // Effect to handle scrolling after navigation to home page
  React.useEffect(() => {
    if (location.pathname === '/' && pendingScrollTarget) {
      // Small delay to ensure the page has rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(pendingScrollTarget);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        setPendingScrollTarget(null);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, pendingScrollTarget]);

  // Defer non-critical Elfsight widgets until user interaction.
  // This protects startup metrics on mobile and still loads widgets shortly after.
  React.useEffect(() => {
    if (location.pathname === '/admin') return;

    const scriptId = 'elfsight-platform-script';
    if (document.getElementById(scriptId)) return;

    let activated = false;
    const inject = () => {
      if (activated) return;
      activated = true;
      if (document.getElementById(scriptId)) return;
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.head.appendChild(script);
      cleanup();
    };

    const activateOnIntent = () => inject();
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'touchstart', 'keydown'];
    events.forEach((eventName) => window.addEventListener(eventName, activateOnIntent, { passive: true }));

    // Safety net: if no interactions happen, still enable chat after the page settles.
    const timer = window.setTimeout(inject, 12000);

    const cleanup = () => {
      window.clearTimeout(timer);
      events.forEach((eventName) => window.removeEventListener(eventName, activateOnIntent));
    };

    return cleanup;
  }, [location.pathname]);

  React.useEffect(() => {
    if (!supabase) {
      setAdminAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setAdminSession(data.session ?? null);
      setAdminAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const routeFallback = (
    <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-gray-600">
      Loading…
    </div>
  );

  // Main routing
  return (
    <ErrorBoundary>
    <div className={`relative ${showCookieBanner ? 'pb-28 sm:pb-24' : ''}`}>
      {location.pathname === '/admin' && (
        <Helmet>
          <title>Admin | 23 Photo Studio</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
      )}
      <Suspense fallback={routeFallback}>
      <Routes>
        <Route 
          path="/" 
          element={
            <WebsiteLayout
              bookings={bookings}
              onBookingFinalized={refetchBookings}
              stripePublishableKey={STRIPE_PUBLISHABLE_KEY}
              onNavigateAndScroll={handleNavigateAndScroll}
            />
          } 
        />
        <Route 
          path="/privacy" 
          element={
            <PrivacyPolicyPage 
              onNavigateAndScroll={handleNavigateAndScroll}
            />
          } 
        />
        <Route 
          path="/terms" 
          element={
            <TermsOfServicePage 
              onNavigateAndScroll={handleNavigateAndScroll}
            />
          } 
        />
        <Route
          path="/studio"
          element={
            <StudioPage
              onNavigateAndScroll={handleNavigateAndScroll}
            />
          }
        />
        <Route
          path="/admin"
          element={
            adminAuthLoading ? (
              <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
                Checking admin session...
              </div>
            ) : adminSession ? (
              <AdminBookingsPage
                bookings={bookings}
                onRefresh={refetchBookings}
                contactMessages={contactMessages}
                messagesLoading={messagesLoading}
                messagesError={messagesError}
                onClearMessagesError={clearMessagesError}
                onRefreshMessages={refetchMessages}
                onUpdateMessageStatus={updateContactMessageStatus}
                onDeleteMessage={deleteContactMessage}
                onSignOut={async () => {
                  if (!supabase) return;
                  await supabase.auth.signOut();
                }}
              />
            ) : (
              <AdminLoginCard />
            )
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>

      {/* Admin-only loading overlay (kept for /admin where data IS the page) */}
      {(loading || messagesLoading) && location.pathname === '/admin' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-studio-green rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Studio Data</h3>
            <p className="text-gray-600">Please wait while we load your information...</p>
          </div>
        </div>
      )}

      {/* Error Overlay — only for booking conflicts (real user-blocking issues). */}
      {/* Other read errors are logged in hooks; the homepage stays usable. */}
      {(error || messagesError) && (error || messagesError)?.includes('time slot') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center max-w-md mx-4">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Conflict</h3>
            <p className="text-gray-600 mb-4">{error || messagesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-studio-green text-white px-6 py-2 rounded hover:bg-studio-green-darker transition-colors duration-200 mr-2"
            >
              Refresh Calendar
            </button>
            <button
              onClick={() => {
                clearError();
                clearMessagesError();
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {location.pathname !== '/admin' && (
        <div
          id="whatsapp-chat-widget"
          className="elfsight-app-501d5393-5e8f-4d92-a575-3e7e35112618"
          data-elfsight-app-lazy
        />
      )}

      {showCookieBanner && (
        <CookieNoticeBanner onChoose={(choice) => setCookieNoticeChoice(choice)} />
      )}
    </div>
    </ErrorBoundary>
  );
}

export default App;