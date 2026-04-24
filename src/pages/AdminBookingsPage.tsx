import React, { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Clock, Plus, ShieldAlert } from 'lucide-react';
import { Booking } from '../types/booking';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateDuration } from '../utils/bookingCalculations';

interface AdminBookingsPageProps {
  bookings: Booking[];
  onRefresh: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

type ManualType = 'manual_booking' | 'manual_block';

type FormState = {
  date: string;
  startTime: string;
  endTime: string;
  type: ManualType;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectType: string;
  notes: string;
};

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
];

const getTimeValue = (timeString: string): number => {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;

  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;

  return hour24 * 60 + minutes;
};

const overlaps = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const aStart = getTimeValue(startA);
  const aEnd = getTimeValue(endA);
  const bStart = getTimeValue(startB);
  const bEnd = getTimeValue(endB);
  return aStart < bEnd && bStart < aEnd;
};

const todayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const AdminBookingsPage: React.FC<AdminBookingsPageProps> = ({ bookings, onRefresh, onSignOut }) => {
  const [selectedDate, setSelectedDate] = useState<string>(todayString());
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    date: todayString(),
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    type: 'manual_block',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectType: '',
    notes: '',
  });

  const dayBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.date === selectedDate && booking.status !== 'cancelled')
        .sort((a, b) => getTimeValue(a.startTime) - getTimeValue(b.startTime)),
    [bookings, selectedDate]
  );

  const submitManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!isSupabaseConfigured || !supabase) {
      setFormError('Supabase is not configured in this build.');
      return;
    }

    if (!form.date || !form.startTime || !form.endTime) {
      setFormError('Date, start time, and end time are required.');
      return;
    }

    if (getTimeValue(form.endTime) <= getTimeValue(form.startTime)) {
      setFormError('End time must be later than start time.');
      return;
    }

    const conflict = bookings.find(
      (booking) =>
        booking.date === form.date &&
        booking.status !== 'cancelled' &&
        overlaps(form.startTime, form.endTime, booking.startTime, booking.endTime)
    );

    if (conflict) {
      setFormError(`Time conflict with existing booking ${conflict.startTime}-${conflict.endTime}.`);
      return;
    }

    const duration = calculateDuration(form.startTime, form.endTime);
    const isBlock = form.type === 'manual_block';
    const clientName = form.clientName.trim() || (isBlock ? 'Manual Calendar Block' : 'Manual Offline Lead');
    const projectType = form.projectType.trim() || (isBlock ? 'Manual Block' : 'Manual Booking');

    setIsSaving(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        date: form.date,
        start_time: form.startTime,
        end_time: form.endTime,
        duration,
        client_name: clientName,
        client_email: form.clientEmail.trim() || 'manual@local.invalid',
        client_phone: form.clientPhone.trim() || '0000000000',
        project_type: projectType,
        total_price: 0,
        status: 'confirmed',
        notes: `[${form.type.toUpperCase()}] ${form.notes.trim()}`.trim(),
        receive_promotional_comms: false,
        agreed_to_terms: true,
        terms_agreed_at: new Date().toISOString(),
        receive_promotional_comms_at: null,
      });

      if (error) throw error;

      setFormSuccess(isBlock ? 'Time block saved.' : 'Manual booking saved.');
      setForm((prev) => ({
        ...prev,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        projectType: '',
        notes: '',
      }));
      setSelectedDate(form.date);
      await onRefresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save manual entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Booking Console</h1>
            <p className="text-sm text-slate-600 mt-1">
              Add manual blocks/bookings (without Stripe) and review occupied slots.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Website
            </a>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded p-5">
            <h2 className="text-lg font-semibold mb-4 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Manual Entry
            </h2>

            <form onSubmit={submitManualEntry} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ManualType }))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="manual_block">Manual Block (no payment)</option>
                    <option value="manual_booking">Manual Booking (offline lead)</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Date</span>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                    required
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Start</span>
                  <select
                    value={form.startTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">End</span>
                  <select
                    value={form.endTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Client name (optional for block)</span>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Project type</span>
                  <input
                    type="text"
                    value={form.projectType}
                    onChange={(e) => setForm((prev) => ({ ...prev, projectType: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                    placeholder={form.type === 'manual_block' ? 'Manual Block' : 'Peerspace / Offline'}
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Client email (optional)</span>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Client phone (optional)</span>
                  <input
                    type="text"
                    value={form.clientPhone}
                    onChange={(e) => setForm((prev) => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </label>
              </div>

              <label className="text-sm block">
                <span className="block mb-1 text-slate-600">Internal notes</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                  placeholder="Peerspace lead, call notes, hold reason, etc."
                />
              </label>

              {formError && (
                <div className="text-sm rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="text-sm rounded border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-60"
              >
                <CalendarDays className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Manual Entry'}
              </button>
            </form>
          </section>

          <section className="bg-white border border-slate-200 rounded p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Occupied Slots
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {!dayBookings.length ? (
              <p className="text-sm text-slate-500">No confirmed bookings/blocks for this date.</p>
            ) : (
              <div className="space-y-3">
                {dayBookings.map((booking) => {
                  const isManual = !booking.stripePaymentIntentId;
                  return (
                    <article key={booking.id} className="border border-slate-200 rounded p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          {booking.startTime} - {booking.endTime}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isManual ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isManual ? 'Manual' : 'Stripe'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{booking.clientName}</p>
                      <p className="text-xs text-slate-500 mt-1">{booking.projectType}</p>
                      {booking.notes && <p className="text-xs text-slate-500 mt-1">{booking.notes}</p>}
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-4 text-xs text-slate-600 border border-amber-200 bg-amber-50 rounded p-3 inline-flex gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
              Manual entries are saved as confirmed bookings with $0 and no Stripe payment intent.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
