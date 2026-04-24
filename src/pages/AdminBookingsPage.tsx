import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { Booking } from '../types/booking';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateDuration } from '../utils/bookingCalculations';

interface AdminBookingsPageProps {
  bookings: Booking[];
  onRefresh: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

type ManualType = 'manual_booking' | 'manual_block';

type ManualFormState = {
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

type EditFormState = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
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

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getMonthGrid = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstDay.getDay(); i += 1) cells.push(null);
  for (let day = 1; day <= lastDay.getDate(); day += 1) cells.push(new Date(year, month, day));
  return cells;
};

const AdminBookingsPage: React.FC<AdminBookingsPageProps> = ({ bookings, onRefresh, onSignOut }) => {
  const [selectedDate, setSelectedDate] = useState<string>(todayString());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  const [manualForm, setManualForm] = useState<ManualFormState>({
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

  const [editForm, setEditForm] = useState<EditFormState | null>(null);

  const monthGrid = useMemo(() => getMonthGrid(currentMonth), [currentMonth]);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== 'cancelled'),
    [bookings]
  );

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => {
      const existing = map.get(booking.date) ?? [];
      existing.push(booking);
      map.set(booking.date, existing);
    });
    return map;
  }, [bookings]);

  const dayBookings = useMemo(
    () =>
      (bookingsByDate.get(selectedDate) ?? [])
        .slice()
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === 'cancelled' ? 1 : -1;
          return getTimeValue(a.startTime) - getTimeValue(b.startTime);
        }),
    [bookingsByDate, selectedDate]
  );

  const monthRevenue = useMemo(
    () =>
      activeBookings
        .filter((b) => {
          const d = new Date(`${b.date}T00:00:00`);
          return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
        })
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    [activeBookings, currentMonth]
  );

  const clearFeedback = () => {
    setFeedbackError(null);
    setFeedbackSuccess(null);
  };

  const ensureSupabase = () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in this build.');
    }
  };

  const hasConflict = (
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: number
  ): Booking | undefined =>
    activeBookings.find(
      (booking) =>
        booking.date === date &&
        booking.id !== excludeBookingId &&
        overlaps(startTime, endTime, booking.startTime, booking.endTime)
    );

  const saveManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (getTimeValue(manualForm.endTime) <= getTimeValue(manualForm.startTime)) {
      setFeedbackError('End time must be later than start time.');
      return;
    }

    const conflict = hasConflict(manualForm.date, manualForm.startTime, manualForm.endTime);
    if (conflict) {
      setFeedbackError(`Conflict with ${conflict.startTime}-${conflict.endTime} (${conflict.clientName}).`);
      return;
    }

    const duration = calculateDuration(manualForm.startTime, manualForm.endTime);
    const isBlock = manualForm.type === 'manual_block';
    const clientName = manualForm.clientName.trim() || (isBlock ? 'Manual Calendar Block' : 'Manual Offline Lead');
    const projectType = manualForm.projectType.trim() || (isBlock ? 'Manual Block' : 'Manual Booking');

    setIsSaving(true);
    try {
      ensureSupabase();
      const { error } = await supabase!.from('bookings').insert({
        date: manualForm.date,
        start_time: manualForm.startTime,
        end_time: manualForm.endTime,
        duration,
        client_name: clientName,
        client_email: manualForm.clientEmail.trim() || 'manual@local.invalid',
        client_phone: manualForm.clientPhone.trim() || '0000000000',
        project_type: projectType,
        total_price: 0,
        status: 'confirmed',
        notes: `[${manualForm.type.toUpperCase()}] ${manualForm.notes.trim()}`.trim(),
        receive_promotional_comms: false,
        agreed_to_terms: true,
        terms_agreed_at: new Date().toISOString(),
        receive_promotional_comms_at: null,
      });
      if (error) throw error;

      setFeedbackSuccess(isBlock ? 'Manual block added.' : 'Manual booking added.');
      setSelectedDate(manualForm.date);
      setManualForm((prev) => ({
        ...prev,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        projectType: '',
        notes: '',
      }));
      await onRefresh();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to save manual entry.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setEditForm({
      id: booking.id,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      projectType: booking.projectType,
      notes: booking.notes,
    });
    clearFeedback();
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    clearFeedback();

    if (getTimeValue(editForm.endTime) <= getTimeValue(editForm.startTime)) {
      setFeedbackError('Edited end time must be later than start time.');
      return;
    }

    const conflict = hasConflict(editForm.date, editForm.startTime, editForm.endTime, editForm.id);
    if (conflict) {
      setFeedbackError(`Conflict with ${conflict.startTime}-${conflict.endTime} (${conflict.clientName}).`);
      return;
    }

    setIsUpdating(true);
    try {
      ensureSupabase();
      const duration = calculateDuration(editForm.startTime, editForm.endTime);

      const { error } = await supabase!
        .from('bookings')
        .update({
          date: editForm.date,
          start_time: editForm.startTime,
          end_time: editForm.endTime,
          duration,
          client_name: editForm.clientName.trim(),
          client_email: editForm.clientEmail.trim(),
          client_phone: editForm.clientPhone.trim(),
          project_type: editForm.projectType.trim(),
          notes: editForm.notes,
        })
        .eq('id', editForm.id);

      if (error) throw error;
      setFeedbackSuccess('Booking updated.');
      setEditingBookingId(null);
      setEditForm(null);
      setSelectedDate(editForm.date);
      await onRefresh();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to update booking.');
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelBooking = async (booking: Booking) => {
    clearFeedback();
    const confirmed = window.confirm(`Cancel booking ${booking.startTime}-${booking.endTime} for ${booking.clientName}?`);
    if (!confirmed) return;

    try {
      ensureSupabase();
      const { error } = await supabase!.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
      if (error) throw error;
      setFeedbackSuccess('Booking cancelled.');
      if (editingBookingId === booking.id) {
        setEditingBookingId(null);
        setEditForm(null);
      }
      await onRefresh();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to cancel booking.');
    }
  };

  const reactivateBooking = async (booking: Booking) => {
    clearFeedback();

    const conflict = hasConflict(booking.date, booking.startTime, booking.endTime, booking.id);
    if (conflict) {
      setFeedbackError('This slot is already taken by another client.');
      return;
    }

    try {
      ensureSupabase();
      const { error } = await supabase!.from('bookings').update({ status: 'confirmed' }).eq('id', booking.id);
      if (error) throw error;
      setFeedbackSuccess('Booking is active again.');
      await onRefresh();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to reactivate booking.');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(next);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Booking Console</h1>
            <p className="text-sm text-slate-600 mt-1">
              Calendar view, manual blocks/bookings, edit time slots, and cancel reservations.
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

        <div className="grid xl:grid-cols-[1.3fr_1fr] gap-6">
          <section className="bg-white border border-slate-200 rounded p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </h2>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded border border-slate-300 hover:bg-slate-50"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-semibold min-w-[160px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded border border-slate-300 hover:bg-slate-50"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs text-slate-500 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-semibold">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthGrid.map((dateObj, idx) => {
                if (!dateObj) {
                  return <div key={`empty-${idx}`} className="h-24 rounded border border-transparent" />;
                }

                const dateKey = formatDate(dateObj);
                const dayEntries = bookingsByDate.get(dateKey) ?? [];
                const activeDayEntries = dayEntries.filter((b) => b.status !== 'cancelled');
                const paidCount = activeDayEntries.filter((b) => !!b.stripePaymentIntentId).length;
                const manualCount = activeDayEntries.filter((b) => !b.stripePaymentIntentId).length;
                const cancelledCount = dayEntries.length - activeDayEntries.length;
                const isSelected = dateKey === selectedDate;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateKey);
                      setManualForm((prev) => ({ ...prev, date: dateKey }));
                    }}
                    className={`h-24 border rounded p-2 text-left transition ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="text-sm font-bold">{dateObj.getDate()}</div>
                    <div className={`mt-2 text-[11px] ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                      {activeDayEntries.length ? `${activeDayEntries.length} active` : 'Available'}
                    </div>
                    {!!paidCount && (
                      <div className={`text-[11px] ${isSelected ? 'text-sky-200' : 'text-sky-700'}`}>
                        Paid: {paidCount}
                      </div>
                    )}
                    {!!manualCount && (
                      <div className={`text-[11px] ${isSelected ? 'text-amber-200' : 'text-amber-700'}`}>
                        Manual: {manualCount}
                      </div>
                    )}
                    {!!cancelledCount && (
                      <div className={`text-[11px] ${isSelected ? 'text-rose-200' : 'text-rose-700'}`}>
                        Cancelled: {cancelledCount}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-slate-500">Selected day</div>
                <div className="font-semibold">{selectedDate}</div>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 inline-flex gap-2 items-center">
                <Clock3 className="h-4 w-4 text-slate-600" />
                <div>
                  <div className="text-slate-500">Bookings today</div>
                  <div className="font-semibold">
                    {dayBookings.filter((b) => b.status !== 'cancelled').length} active /{' '}
                    {dayBookings.filter((b) => b.status === 'cancelled').length} cancelled
                  </div>
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 inline-flex gap-2 items-center">
                <CircleDollarSign className="h-4 w-4 text-emerald-700" />
                <div>
                  <div className="text-slate-500">Month revenue</div>
                  <div className="font-semibold">${monthRevenue}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded p-5">
            <h2 className="text-lg font-semibold mb-4 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Manual Entry
            </h2>

            <form onSubmit={saveManualEntry} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Type</span>
                  <select
                    value={manualForm.type}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, type: e.target.value as ManualType }))}
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
                    value={manualForm.date}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                    required
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Start</span>
                  <select
                    value={manualForm.startTime}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, startTime: e.target.value }))}
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
                    value={manualForm.endTime}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, endTime: e.target.value }))}
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

              <label className="text-sm block">
                <span className="block mb-1 text-slate-600">Client Name</span>
                <input
                  type="text"
                  value={manualForm.clientName}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, clientName: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Email</span>
                  <input
                    type="email"
                    value={manualForm.clientEmail}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="block mb-1 text-slate-600">Phone</span>
                  <input
                    type="text"
                    value={manualForm.clientPhone}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </label>
              </div>

              <label className="text-sm block">
                <span className="block mb-1 text-slate-600">Project Type</span>
                <input
                  type="text"
                  value={manualForm.projectType}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, projectType: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </label>

              <label className="text-sm block">
                <span className="block mb-1 text-slate-600">Notes</span>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </form>

            <div className="mt-4 text-xs text-slate-600 border border-amber-200 bg-amber-50 rounded p-3 inline-flex gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
              Manual entries are saved as confirmed bookings with $0 and no Stripe payment intent.
            </div>
          </section>
        </div>

        <section className="bg-white border border-slate-200 rounded p-5 mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Bookings for {selectedDate}
          </h2>

          {feedbackError && (
            <div className="mb-4 text-sm rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2">
              {feedbackError}
            </div>
          )}
          {feedbackSuccess && (
            <div className="mb-4 text-sm rounded border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">
              {feedbackSuccess}
            </div>
          )}

          {!dayBookings.length ? (
            <p className="text-sm text-slate-500">No bookings for this date.</p>
          ) : (
            <div className="space-y-3">
              {dayBookings.map((booking) => {
                const isPaid = !!booking.stripePaymentIntentId;
                const isCancelled = booking.status === 'cancelled';
                const isEditing = editingBookingId === booking.id && !!editForm;
                return (
                  <article key={booking.id} className={`border rounded p-4 ${isCancelled ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200'}`}>
                    {!isEditing ? (
                      <>
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {booking.startTime} - {booking.endTime}
                            </p>
                            <p className="text-sm text-slate-700">{booking.clientName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${isPaid ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                              {isPaid ? 'Stripe Paid' : 'Manual'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${isCancelled ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {isCancelled ? 'Cancelled' : 'Active'}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                              ${booking.totalPrice}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {booking.projectType} {booking.clientEmail ? `• ${booking.clientEmail}` : ''} {booking.clientPhone ? `• ${booking.clientPhone}` : ''}
                        </p>
                        {booking.notes && <p className="text-xs text-slate-500 mt-1">{booking.notes}</p>}

                        <div className="mt-3 flex gap-2">
                          {!isCancelled ? (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(booking)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded border border-slate-300 hover:bg-slate-50"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelBooking(booking)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded border border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => reactivateBooking(booking)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            >
                              Make Active
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <form onSubmit={saveEdit} className="space-y-3">
                        <div className="grid sm:grid-cols-3 gap-3">
                          <label className="text-sm">
                            <span className="block mb-1 text-slate-600">Date</span>
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm((prev) => (prev ? { ...prev, date: e.target.value } : prev))}
                              className="w-full border border-slate-300 rounded px-3 py-2"
                            />
                          </label>
                          <label className="text-sm">
                            <span className="block mb-1 text-slate-600">Start</span>
                            <select
                              value={editForm.startTime}
                              onChange={(e) => setEditForm((prev) => (prev ? { ...prev, startTime: e.target.value } : prev))}
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
                              value={editForm.endTime}
                              onChange={(e) => setEditForm((prev) => (prev ? { ...prev, endTime: e.target.value } : prev))}
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

                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editForm.clientName}
                            onChange={(e) => setEditForm((prev) => (prev ? { ...prev, clientName: e.target.value } : prev))}
                            className="border border-slate-300 rounded px-3 py-2 text-sm"
                            placeholder="Client name"
                          />
                          <input
                            type="text"
                            value={editForm.projectType}
                            onChange={(e) => setEditForm((prev) => (prev ? { ...prev, projectType: e.target.value } : prev))}
                            className="border border-slate-300 rounded px-3 py-2 text-sm"
                            placeholder="Project type"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            type="email"
                            value={editForm.clientEmail}
                            onChange={(e) => setEditForm((prev) => (prev ? { ...prev, clientEmail: e.target.value } : prev))}
                            className="border border-slate-300 rounded px-3 py-2 text-sm"
                            placeholder="Client email"
                          />
                          <input
                            type="text"
                            value={editForm.clientPhone}
                            onChange={(e) => setEditForm((prev) => (prev ? { ...prev, clientPhone: e.target.value } : prev))}
                            className="border border-slate-300 rounded px-3 py-2 text-sm"
                            placeholder="Client phone"
                          />
                        </div>

                        <textarea
                          rows={2}
                          value={editForm.notes}
                          onChange={(e) => setEditForm((prev) => (prev ? { ...prev, notes: e.target.value } : prev))}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                          placeholder="Notes"
                        />

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm hover:bg-slate-700 disabled:opacity-60"
                          >
                            {isUpdating ? 'Saving...' : 'Save changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBookingId(null);
                              setEditForm(null);
                            }}
                            className="px-3 py-1.5 rounded border border-slate-300 text-sm hover:bg-slate-50"
                          >
                            Cancel edit
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
