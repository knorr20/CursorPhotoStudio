import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import WebsiteLayout from './pages/WebsiteLayout';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import NotFoundPage from './pages/NotFoundPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminLoginCard from './components/AdminLoginCard';
import ErrorBoundary from './components/ErrorBoundary';
import { useBookings } from './hooks/useBookings';
import { useContactMessages } from './hooks/useContactMessages';
import { supabase } from './lib/supabase';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<Session | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  
  const STRIPE_PUBLISHABLE_KEY = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) ?? '';

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

  // Main routing
  return (
    <ErrorBoundary>
    <div className="relative">
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

      {/* Loading Overlay */}
      {(loading || (messagesLoading && location.pathname !== '/admin')) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-studio-green rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Studio Data</h3>
            <p className="text-gray-600">Please wait while we load your information...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {(error || (messagesError && location.pathname !== '/admin')) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center max-w-md mx-4">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {(error || messagesError)?.includes('time slot') ? 'Booking Conflict' : 'Error'}
            </h3>
            <p className="text-gray-600 mb-4">{error || messagesError}</p>
            {!(error || messagesError)?.includes('time slot') && (
              <p className="text-sm text-gray-500 mb-6">
                Please make sure Supabase is properly configured. Check the console for more details.
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-studio-green text-white px-6 py-2 rounded hover:bg-studio-green-darker transition-colors duration-200 mr-2"
            >
              {(error || messagesError)?.includes('time slot') ? 'Refresh Calendar' : 'Retry'}
            </button>
            {(error || messagesError)?.includes('time slot') && (
              <button
                onClick={() => {
                  clearError();
                  clearMessagesError();
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}

export default App;