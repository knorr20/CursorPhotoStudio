import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Booking } from '../types/booking';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertDbRowToBooking = (row: any): Booking => ({
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
  duration: row.duration ?? '',
  clientName: row.client_name ?? 'Booked slot',
  clientEmail: row.client_email ?? '',
  clientPhone: row.client_phone ?? '',
  projectType: row.project_type ?? 'N/A',
  totalPrice: row.total_price ?? 0,
    status: row.status,
  notes: row.notes ?? '',
    agreedToTerms: row.agreed_to_terms || false,
    termsAgreedAt: row.terms_agreed_at,
    createdAt: row.created_at,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? null,
    paymentStatus: row.payment_status ?? 'paid',
    receiptUrl: row.receipt_url ?? null,
  });

  const fetchBookings = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(
        'Missing Supabase environment variables. In Vercel add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for this environment, then redeploy (Clear build cache if needed).'
      );
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const query = session
        ? supabase.from('bookings').select('*').order('created_at', { ascending: false })
        : supabase.from('bookings_public_calendar').select('*').order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setBookings(data?.map(convertDbRowToBooking) || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    clearError: () => setError(null),
    refetch: fetchBookings,
  };
};
