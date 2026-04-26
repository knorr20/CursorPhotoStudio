import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, DollarSign, X, CheckCircle, User, Mail, Phone, FileText, Camera, AlertTriangle, Check, Pencil } from 'lucide-react';
import { Booking, BookingFormData } from '../types/booking';
import BookingConfirmationModal from './BookingConfirmationModal';
import StripePaymentModal from './StripePaymentModal';
import TermsAndPrivacyLinks from './TermsAndPrivacyLinks';
import BookingStepsIndicator from './BookingStepsIndicator';
import MobileBookingBar from './MobileBookingBar';
import { getTimeValue, isWeekend, calculateDuration, calculatePrice } from '../utils/bookingCalculations';
import { formatPhoneNumber, isValidPhone } from '../utils/phoneFormat';

interface CalendarProps {
  bookings: Booking[];
  onBookingFinalized: () => Promise<void>;
  stripePublishableKey: string;
}

const Calendar: React.FC<CalendarProps> = ({ bookings, onBookingFinalized, stripePublishableKey }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<Omit<Booking, 'id' | 'createdAt'> | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConsentWarning, setShowConsentWarning] = useState(false);
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectType: '',
    notes: '',
    agreedToTerms: false
  });
  const [honeypotValue, setHoneypotValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'clientName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'clientEmail':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'clientPhone':
        if (!value.trim()) return 'Phone number is required';
        if (!isValidPhone(value)) return 'Enter a 10-digit phone number';
        return '';
      case 'projectType':
        return '';
      default:
        return '';
    }
  }, []);

  const getFieldError = (name: string): string => {
    if (!fieldTouched[name]) return '';
    const value = bookingFormData[name as keyof BookingFormData] as string;
    return validateField(name, value);
  };

  const isFormValid = (): boolean => {
    return (
      validateField('clientName', bookingFormData.clientName) === '' &&
      validateField('clientEmail', bookingFormData.clientEmail) === '' &&
      validateField('clientPhone', bookingFormData.clientPhone) === ''
    );
  };

  const handleFieldBlur = (name: string) => {
    setFieldTouched(prev => ({ ...prev, [name]: true }));
  };

  // Refs for scrolling between booking steps
  const timeSelectionRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
  ];

  const projectTypes = [
    'Portrait Photography',
    'Product Photography',
    'Fashion Photography',
    'Video Production',
    'Commercial Photography',
    'Event Photography',
    'Other'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newDate);
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setShowBookingForm(false);
  };

  const formatDate = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isWeekend = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
  };

  const getTimeValue = (timeString: string) => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes;
  };

  // Enhanced function to check if there are at least 2 consecutive hours available that end by 7 PM
  const hasMinimumConsecutiveHours = (dateString: string, availableSlots: number[]) => {
    if (availableSlots.length < 2) return false;
    
    // Sort available slots
    const sortedSlots = [...availableSlots].sort((a, b) => a - b);
    
    // 7 PM is 19:00 (1140 minutes from midnight)
    const maxEndTime = getTimeValue('7:00 PM');
    
    // Check for at least 2 consecutive hours that end by 7 PM
    for (let i = 0; i < sortedSlots.length; i++) {
      const startTime = sortedSlots[i];
      
      // Check if we can fit a 2-hour booking starting from this slot
      if (startTime + 120 <= maxEndTime) {
        // Check if the next hour is also available
        if (sortedSlots.includes(startTime + 60)) {
          return true;
        }
      }
    }
    
    return false;
  };

  const isToday = (dateString: string) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return dateString === `${y}-${m}-${d}`;
  };

  const getCurrentTimeMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const isTimeSlotPast = (timeSlot: string, dateString: string) => {
    if (!isToday(dateString)) return false;
    return getTimeValue(timeSlot) <= getCurrentTimeMinutes();
  };

  const getDayBookingStatus = (day: number | null) => {
    if (!day) return 'empty';

    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return 'past';

    const dateString = formatDate(day);
    const dayBookings = bookings.filter(booking =>
      booking.date === dateString && booking.status !== 'cancelled'
    );

    const allTimeSlots = timeSlots.map(slot => getTimeValue(slot));
    const bookedSlots = new Set<number>();

    dayBookings.forEach(booking => {
      const startTime = getTimeValue(booking.startTime);
      const endTime = getTimeValue(booking.endTime);
      for (let time = startTime; time < endTime; time += 60) {
        bookedSlots.add(time);
      }
    });

    const currentMinutes = getCurrentTimeMinutes();
    const availableSlots = allTimeSlots.filter(slot => {
      if (bookedSlots.has(slot)) return false;
      if (isToday(dateString) && slot <= currentMinutes) return false;
      return true;
    });

    if (availableSlots.length === 0) return 'fully-booked';

    if (!hasMinimumConsecutiveHours(dateString, availableSlots)) {
      return 'fully-booked';
    }

    if (availableSlots.length < allTimeSlots.length) return 'partially-booked';

    return 'available';
  };

  const isTimeSlotUnavailable = (timeSlot: string, date: string) => {
    const timeValue = getTimeValue(timeSlot);
    const dayBookings = bookings.filter(booking => 
      booking.date === date && booking.status !== 'cancelled'
    );
    
    // Check if this time slot conflicts with any existing booking
    return dayBookings.some(booking => {
      const startTime = getTimeValue(booking.startTime);
      const endTime = getTimeValue(booking.endTime);
      return timeValue >= startTime && timeValue < endTime;
    });
  };

  // Helper function to check if a time slot is the start of an existing booking
  const isTimeSlotStartOfExistingBooking = (timeSlot: string, date: string) => {
    const timeValue = getTimeValue(timeSlot);
    return bookings.some(booking =>
      booking.date === date &&
      booking.status !== 'cancelled' &&
      getTimeValue(booking.startTime) === timeValue
    );
  };

  const canSelectStartTime = (timeSlot: string, date: string) => {
    if (isTimeSlotPast(timeSlot, date)) return false;
    if (isTimeSlotUnavailable(timeSlot, date)) return false;
    
    const timeValue = getTimeValue(timeSlot);
    const dayBookings = bookings.filter(booking => 
      booking.date === date && booking.status !== 'cancelled'
    );
    
    // Check if there are at least 2 consecutive hours available from this start time
    // and that the booking would end by 7 PM
    const maxEndTime = getTimeValue('7:00 PM'); // 7 PM is the latest end time
    
    // Check if a 2-hour booking from this start time would end by 7 PM
    if (timeValue + 120 > maxEndTime) {
      return false; // Would extend past 7 PM
    }
    
    // Check if the next hour is also available
    const nextHourTime = timeValue + 60;
    const isNextHourBooked = dayBookings.some(booking => {
      const startTime = getTimeValue(booking.startTime);
      const endTime = getTimeValue(booking.endTime);
      return nextHourTime >= startTime && nextHourTime < endTime;
    });
    
    return !isNextHourBooked;
  };

  const getBookingForDate = (day: number | null) => {
    if (!day) return null;
    const dateString = formatDate(day);
    return bookings.find(booking => booking.date === dateString);
  };

  const getDurationAndPrice = () => {
    if (!selectedStartTime || !selectedEndTime || !selectedDate) {
      return { duration: { hours: 0, minutes: 0, text: '' }, price: { total: 0, hourlyRate: 0, breakdown: '' } };
    }
    
    const duration = calculateDuration(selectedStartTime, selectedEndTime);
    const price = calculatePrice(selectedDate, selectedStartTime, selectedEndTime);
    
    return { duration, price };
  };

  // Combined time slot click handler
  const handleTimeSlotClick = (timeSlot: string) => {
    if (!selectedDate) return;
    
    const timeValue = getTimeValue(timeSlot);
    const maxEndTime = getTimeValue('7:00 PM');
    
    // If no start time is selected, set this as start time
    if (!selectedStartTime) {
      if (canSelectStartTime(timeSlot, selectedDate)) {
        setSelectedStartTime(timeSlot);
        setSelectedEndTime(null);
      }
      return;
    }
    
    const startValue = getTimeValue(selectedStartTime);
    
    // If clicking on the same time as start time, reset selection
    if (timeSlot === selectedStartTime) {
      setSelectedStartTime(null);
      setSelectedEndTime(null);
      return;
    }
    
    // If both start and end are selected, reset and set new start time
    if (selectedStartTime && selectedEndTime) {
      if (canSelectStartTime(timeSlot, selectedDate)) {
        setSelectedStartTime(timeSlot);
        setSelectedEndTime(null);
      }
      return;
    }
    
    // If start time is selected but no end time
    if (selectedStartTime && !selectedEndTime) {
      const timeValue = getTimeValue(timeSlot);
      const startValue = getTimeValue(selectedStartTime);

      // If the clicked time slot is before or equal to the selected start time,
      // it cannot be an end time. In this case, we should treat it as a new start time selection.
      if (timeValue <= startValue) {
        if (canSelectStartTime(timeSlot, selectedDate)) {
          setSelectedStartTime(timeSlot);
          setSelectedEndTime(null);
        }
        return; // Exit after attempting to set new start time
      }

      // If the clicked time slot is after the selected start time,
      // check its status to see if it can be a valid end time.
      const status = getTimeSlotStatus(timeSlot);
      if (status === 'available') {
        setSelectedEndTime(timeSlot);
      } else {
        // If it's not 'available' (e.g., 'booked', 'range-blocked', 'too-short-duration'),
        // we don't allow it as an end time. The UI already shows it as disabled/invalid.
      }
    }
  };

  // Helper function to check if entire time range is available
  const isRangeFullyAvailable = (startTime: string, endTime: string, date: string): boolean => {
    if (!startTime || !endTime || !date) return false;
    
    const startValue = getTimeValue(startTime);
    const endValue = getTimeValue(endTime);
    
    // Check every hour slot in the range
    for (let time = startValue; time < endValue; time += 60) {
      // Convert time back to string format to check availability
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      let displayHours = hours;
      let period = 'AM';
      
      if (hours >= 12) {
        period = 'PM';
        if (hours > 12) {
          displayHours = hours - 12;
        }
      }
      if (hours === 0) {
        displayHours = 12;
      }
      
      const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      
      // Check if this specific time slot is unavailable
      if (isTimeSlotUnavailable(timeString, date)) {
        return false;
      }
    }
    
    return true;
  };

  const getTimeSlotStatus = (timeSlot: string) => {
    if (!selectedDate) return 'available';

    if (isTimeSlotPast(timeSlot, selectedDate)) return 'booked';

    const timeValue = getTimeValue(timeSlot);
    const maxEndTime = getTimeValue('7:00 PM');

    const isOccupiedByExistingBooking = isTimeSlotUnavailable(timeSlot, selectedDate);
    const isStartOfExistingBooking = isTimeSlotStartOfExistingBooking(timeSlot, selectedDate);

    // If no selection, check if it can be a valid start time
    if (!selectedStartTime && !selectedEndTime) {
      if (isOccupiedByExistingBooking) {
        return 'booked';
      }
      return canSelectStartTime(timeSlot, selectedDate) ? 'available' : 'invalid';
    }
    
    // If this is the selected start time
    if (timeSlot === selectedStartTime) return 'start';
    
    // If this is the selected end time
    if (timeSlot === selectedEndTime) return 'end';
    
    // If we have both start and end, check if this slot is in the range
    if (selectedStartTime && selectedEndTime) {
      const startValue = getTimeValue(selectedStartTime);
      const endValue = getTimeValue(selectedEndTime);
      if (timeValue > startValue && timeValue < endValue) {
        return 'in-range';
      }
      // If slot is occupied by existing booking (but not start of booking), it's unavailable
      if (isOccupiedByExistingBooking && !isStartOfExistingBooking) {
        return 'booked';
      }
      return 'available';
    }
    
    // If we only have start time, check if this can be a valid end time
    if (selectedStartTime && !selectedEndTime) {
      const startValue = getTimeValue(selectedStartTime);
      
      // If this slot is occupied by existing booking AND it's NOT the start of that booking,
      // then it's truly unavailable as an end time
      if (isOccupiedByExistingBooking && !isStartOfExistingBooking) {
        return 'booked';
      }
      
      if (timeValue <= startValue || timeValue > maxEndTime) {
        return canSelectStartTime(timeSlot, selectedDate) ? 'available' : 'invalid';
      }
      
      // Check if selecting this as end time would result in less than 2 hours
      const durationMinutes = timeValue - startValue;
      if (durationMinutes < 120) { // Less than 2 hours (120 minutes)
        return 'too-short-duration';
      }
      
      // Check if the entire range from start to this end time is available
      if (!isRangeFullyAvailable(selectedStartTime, timeSlot, selectedDate)) {
        return 'range-blocked';
      }
      
      return 'available';
    }
    
    return 'available';
  };

  const getTimeSlotClasses = (status: string) => {
    const baseClasses = 'p-4 text-sm font-medium border-2 transition-colors duration-200 cursor-pointer ';
    
    switch (status) {
      case 'booked':
        return baseClasses + 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed';
      case 'range-blocked':
        return baseClasses + 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed';
      case 'start':
        return baseClasses + 'border-studio-green bg-studio-green text-white';
      case 'end':
        return baseClasses + 'border-studio-green bg-studio-green text-white';
      case 'in-range':
        return baseClasses + 'border-studio-green/30 bg-studio-green/10 text-studio-green';
      case 'invalid':
        return baseClasses + 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed';
      case 'too-short-duration':
        return baseClasses + 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed';
      case 'available':
      default:
        return baseClasses + 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50';
    }
  };

  const getTimeSlotLabel = (timeSlot: string, status: string) => {
    if (status === 'booked') return 'Booked';
    if (status === 'range-blocked') return 'Blocked';
    if (status === 'start') return 'Start';
    if (status === 'end') return 'End';
    if (status === 'invalid') return 'No 2hr';
    if (status === 'too-short-duration') return '2hr min';
    return '';
  };

  const isBookingValid = () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return false;
    
    // Check if the entire selected range is available
    if (!isRangeFullyAvailable(selectedStartTime, selectedEndTime, selectedDate)) return false;
    
    const duration = calculateDuration(selectedStartTime, selectedEndTime);
    const totalMinutes = duration.hours * 60 + duration.minutes;
    const endValue = getTimeValue(selectedEndTime);
    const maxEndTime = getTimeValue('7:00 PM');
    
    return totalMinutes >= 120 && endValue <= maxEndTime; // Strictly require at least 120 minutes (2 hours) and end by 7 PM
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'clientPhone') {
      setBookingFormData(prev => ({
        ...prev,
        clientPhone: formatPhoneNumber(value)
      }));
      return;
    }

    setBookingFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProceedToBooking = () => {
    if (!isBookingValid()) return;

    if (!agreedToTerms) {
      setShowConsentWarning(true);
      return;
    }

    setShowBookingForm(true);
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldTouched({
      clientName: true,
      clientEmail: true,
      clientPhone: true,
    });

    if (!isFormValid() || !selectedDate || !selectedStartTime || !selectedEndTime) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const duration = calculateDuration(selectedStartTime, selectedEndTime);
      const price = calculatePrice(selectedDate, selectedStartTime, selectedEndTime);
      const now = new Date().toISOString();
      const normalizedProjectType = bookingFormData.projectType.trim() || 'Not specified';

      const newBooking: Omit<Booking, 'id' | 'createdAt'> = {
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        duration: duration.text,
        clientName: bookingFormData.clientName,
        clientEmail: bookingFormData.clientEmail,
        clientPhone: bookingFormData.clientPhone,
        projectType: normalizedProjectType,
        totalPrice: price.total,
        agreedToTerms: agreedToTerms,
        status: 'confirmed',
        notes: bookingFormData.notes,
        termsAgreedAt: agreedToTerms ? now : null,
      };

      setConfirmedBookingDetails(newBooking);
      setShowPaymentModal(true);

      setSelectedDate(null);
      setSelectedStartTime(null);
      setSelectedEndTime(null);
      setShowConsentWarning(false);
      setShowBookingForm(false);
      setBookingFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        projectType: '',
        notes: '',
        agreedToTerms: false
      });
      setAgreedToTerms(false);
      setHoneypotValue('');
      setFieldTouched({});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit booking. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await onBookingFinalized();
    setShowPaymentModal(false);
    setShowConfirmationModal(true);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setConfirmedBookingDetails(null);
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
    setConfirmedBookingDetails(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const { duration, price } = getDurationAndPrice();

  const currentStep: 1 | 2 | 3 = showPaymentModal ? 3 : showBookingForm ? 2 : 1;

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const selectedTimeLabel = selectedStartTime && selectedEndTime
    ? `${selectedStartTime} – ${selectedEndTime}${duration.text ? ` · ${duration.text}` : ''}`
    : selectedStartTime
    ? `${selectedStartTime} – pick end time`
    : null;

  const mobileBarDisabledReason = !isBookingValid()
    ? 'Select a start and end time'
    : !agreedToTerms
    ? 'Agree to terms to continue'
    : '';

  const handleEditDate = () => {
    setShowBookingForm(false);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setShowConsentWarning(false);
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleEditTime = () => {
    setShowBookingForm(false);
    setShowConsentWarning(false);
    setTimeout(() => {
      timeSelectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <section id="booking" className="pt-10 pb-28 md:pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-heading font-black text-gray-900 mb-3 uppercase">Book Your Studio Time</h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Pick a date and time below — booking takes about a minute.
          </p>
          <BookingStepsIndicator currentStep={currentStep} />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Calendar */}
          <div ref={calendarRef} className="scroll-mt-20">
            <div className="text-center mb-4">
              <div className="text-xs font-heading font-black uppercase tracking-wider text-studio-green mb-1">Step 1</div>
              <h3 className="text-2xl font-heading font-black text-gray-900 uppercase">Pick your date</h3>
            </div>

            <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-studio-green" />
                <span>Open 8 AM – 7 PM</span>
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-studio-green" />
                <span>2-hour minimum</span>
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-studio-green" />
                <span>From $40/hr · Best price 5+ hours</span>
              </span>
            </div>

            <div className="bg-white shadow-xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-3 hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <h4 className="text-2xl font-heading font-black text-gray-900" aria-live="polite">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-3 hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs sm:text-sm md:text-lg font-heading font-black text-gray-600 py-2 sm:py-4">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const isSelected = day && selectedDate === formatDate(day);
                  const bookingStatus = getDayBookingStatus(day);
                  const isWeekendDay = isWeekend(day);
                  const booking = getBookingForDate(day);
                  
                  let buttonClasses = 'aspect-square p-1 sm:p-2 md:p-4 text-sm sm:text-base md:text-lg font-semibold transition-all duration-200 relative min-h-[44px] sm:min-h-[50px] md:min-h-[60px] flex items-center justify-center ';
                  let isClickable = false;
                  
                  if (!day) {
                    buttonClasses += '';
                  } else {
                    switch (bookingStatus) {
                      case 'available':
                        isClickable = true;
                        buttonClasses += isSelected
                          ? 'bg-studio-green text-white'
                          : 'hover:bg-studio-green/10 text-gray-900 bg-studio-green/5';
                        break;
                      case 'partially-booked':
                        isClickable = true;
                        buttonClasses += isSelected
                          ? 'bg-studio-green text-white'
                          : 'hover:bg-orange-100 text-orange-800 bg-orange-50';
                        break;
                      case 'fully-booked':
                        buttonClasses += 'bg-red-100 text-red-800 cursor-not-allowed';
                        break;
                      case 'past':
                        buttonClasses += 'text-gray-300 cursor-not-allowed bg-gray-50';
                        break;
                    }
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (day && isClickable) {
                          setSelectedDate(formatDate(day));
                          setSelectedStartTime(null);
                          setSelectedEndTime(null);
                          setShowConsentWarning(false);
                          setShowBookingForm(false);
                          
                          // Scroll to time selection section after a short delay
                          setTimeout(() => {
                            timeSelectionRef.current?.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }, 100);
                        }
                      }}
                      disabled={!day || !isClickable}
                      className={buttonClasses}
                      title={booking ? `Booked: ${booking.startTime} - ${booking.endTime}` : ''}
                      aria-label={day ? `${monthNames[currentMonth.getMonth()]} ${day}, ${
                        bookingStatus === 'available' ? 'Available' :
                        bookingStatus === 'partially-booked' ? 'Partially booked' :
                        bookingStatus === 'fully-booked' ? 'Fully booked' : 'Past date'
                      }` : undefined}
                    >
                      {day}
                      {day && (
                        <>
                          {bookingStatus === 'available' && (
                            <CheckCircle className="absolute top-0.5 right-0.5 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          )}
                          {bookingStatus === 'partially-booked' && (
                            <AlertTriangle className="absolute top-0.5 right-0.5 h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                          )}
                          {bookingStatus === 'fully-booked' && (
                            <X className="absolute top-0.5 right-0.5 h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-6 mb-6 text-sm text-gray-500 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span>Partially Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-600" />
                  <span>Fully Booked</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && !showBookingForm && (
            <div ref={timeSelectionRef} className="bg-white shadow-xl p-6 sm:p-8 max-w-4xl mx-auto scroll-mt-20 mt-6">
              <div className="text-center mb-4">
                <div className="text-xs font-heading font-black uppercase tracking-wider text-studio-green mb-1">Step 1 cont.</div>
                <h3 className="text-2xl font-heading font-black text-gray-900 uppercase">Pick start and end time</h3>
              </div>

              <div className="text-center p-5 sm:p-6 bg-gray-50 mb-6">
                <div className="text-lg sm:text-xl font-heading font-black text-gray-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm sm:text-base text-gray-600 mt-2">
                  {isWeekend(parseInt(selectedDate.split('-')[2]))
                    ? 'Weekend Rate · $50–$60/hr'
                    : 'Weekday Rate · $40–$50/hr'}
                </div>
              </div>

              {/* Info Text — shown BEFORE the grid so the rules are clear up front */}
              <div className="text-center text-xs text-gray-500 uppercase tracking-wide mb-4">
                2-hour minimum • Studio closes at 7 PM • For best price rent 5+ hours
              </div>

              {/* Time Slots Grid */}
              <div className="mb-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {timeSlots.map((time) => {
                    const status = getTimeSlotStatus(time);
                    const label = getTimeSlotLabel(time, status);

                    return (
                      <button
                        key={time}
                        onClick={() => {
                          handleTimeSlotClick(time);
                          setShowConsentWarning(false);
                        }}
                        disabled={status === 'booked' || status === 'invalid' || status === 'too-short-duration' || status === 'range-blocked'}
                        className={`${getTimeSlotClasses(status)} h-[64px] sm:h-[80px] flex flex-col items-center justify-center`}
                        aria-label={`${time}, ${label || 'Available'}`}
                      >
                        <div className="text-center flex flex-col items-center justify-center h-full">
                          <div>{time}</div>
                          {label && (
                            <div className="text-[0.6rem] mt-0 opacity-75 leading-tight">{label}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedStartTime && selectedEndTime && duration.text && (
                <div className="space-y-4">
                  {price.total > 0 ? (
                    <>
                    <div className="bg-studio-green/10 border-2 border-studio-green/20 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-6 w-6 text-studio-green" />
                          <div>
                            <div className="text-lg font-heading font-black text-gray-900">Duration: {duration.text}</div>
                            <div className="text-gray-600">{selectedStartTime} - {selectedEndTime}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-6 w-6 text-studio-green" />
                          <div>
                            <div className="text-2xl font-heading font-black text-studio-green">${price.total}</div>
                            <div className="text-studio-green text-sm">{price.breakdown}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(() => {
                      const totalHours = duration.hours + (duration.minutes / 60);
                      if (totalHours >= 3 && totalHours < 5) {
                        const weekend = selectedDate ? isWeekend(parseInt(selectedDate.split('-')[2])) : false;
                        const discountRate = weekend ? 50 : 40;
                        const fiveHourPrice = 5 * discountRate;
                        if (fiveHourPrice <= price.total) {
                          return (
                            <div className="bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-amber-600 flex-shrink-0" />
                              <span className="text-amber-800">
                                <strong>Tip:</strong> Book 5 hours for ${fiveHourPrice} — same price, more studio time!
                              </span>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                    </>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-200 p-6">
                      <div className="text-red-800 font-semibold text-lg">
                        Minimum 2 hours required
                      </div>
                      <div className="text-red-600 mt-2">
                        Please select an end time that gives you at least 2 hours of studio time and ends by 7 PM.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isBookingValid() && (
                <div className={`mt-8 space-y-3 text-sm border-t pt-6 transition-colors duration-300 ${
                  showConsentWarning ? 'border-red-300 bg-red-50/50 -mx-4 px-4 py-4' : 'border-gray-200'
                }`}>
                  <div className={`transition-all duration-300 ${
                    showConsentWarning && !agreedToTerms ? 'motion-safe:animate-pulse' : ''
                  }`}>
                    <label className={`inline-flex items-start cursor-pointer transition-colors duration-300 ${
                      showConsentWarning && !agreedToTerms ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      <input
                        type="checkbox"
                        name="agreedToTerms"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked);
                          if (e.target.checked) {
                            setShowConsentWarning(false);
                          }
                        }}
                        required
                        className={`form-checkbox h-5 w-5 mt-0.5 text-studio-green transition-all duration-300 ease-in-out rounded focus:ring-2 flex-shrink-0 ${
                          showConsentWarning && !agreedToTerms
                            ? 'border-red-500 focus:ring-red-500 ring-2 ring-red-200'
                            : 'border-gray-300 focus:ring-studio-green'
                        }`}
                      />
                      <span className="ml-2">
                        <TermsAndPrivacyLinks />
                      </span>
                    </label>
                    {showConsentWarning && !agreedToTerms && (
                      <div className="mt-2 ml-7 text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        Please agree to the Terms and Privacy Policy to continue.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleProceedToBooking}
                disabled={!isBookingValid()}
                className={`w-full mt-6 py-4 px-6 text-lg uppercase transition-all duration-200 font-heading font-black ${
                  isBookingValid()
                    ? agreedToTerms
                      ? 'bg-studio-green hover:bg-studio-green-darker text-white cursor-pointer shadow-lg hover:shadow-xl'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!isBookingValid()
                  ? 'Select a time to continue'
                  : !agreedToTerms
                  ? 'Agree to terms to continue'
                  : `Continue · $${price.total}`
                }
              </button>
            </div>
          )}

          {/* Booking Form */}
          {showBookingForm && (
            <div className="bg-white shadow-xl p-6 sm:p-8 max-w-4xl mx-auto mt-6">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <div className="text-xs font-heading font-black uppercase tracking-wider text-studio-green mb-1">Step 2</div>
                  <h3 className="text-2xl font-heading font-black text-gray-900 uppercase">Your details</h3>
                </div>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 -m-2"
                  aria-label="Back to time selection"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 p-5 sm:p-6 mb-6 sm:mb-8">
                <h4 className="text-lg font-heading font-black text-gray-900 mb-4">Booking Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Date:</span>
                      <button
                        type="button"
                        onClick={handleEditDate}
                        className="inline-flex items-center gap-1 text-xs text-studio-green hover:text-studio-green-darker font-heading font-black uppercase tracking-wide"
                      >
                        <Pencil className="h-3 w-3" />
                        Change
                      </button>
                    </div>
                    <div className="font-heading font-black mt-1">
                      {new Date(selectedDate! + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Time:</span>
                      <button
                        type="button"
                        onClick={handleEditTime}
                        className="inline-flex items-center gap-1 text-xs text-studio-green hover:text-studio-green-darker font-heading font-black uppercase tracking-wide"
                      >
                        <Pencil className="h-3 w-3" />
                        Change
                      </button>
                    </div>
                    <div className="font-heading font-black mt-1">{selectedStartTime} - {selectedEndTime}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-heading font-black text-studio-green text-lg mt-1">${price.total}</div>
                  </div>
                </div>
              </div>

              {/* Client Information Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Honeypot field - hidden from users but visible to bots */}
                <input
                  type="text"
                  name="website"
                  value={honeypotValue}
                  onChange={(e) => setHoneypotValue(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      value={bookingFormData.clientName}
                      onChange={handleFormChange}
                      onBlur={() => handleFieldBlur('clientName')}
                      className={`w-full px-4 py-3 border transition-colors duration-200 focus:ring-2 focus:border-transparent ${
                        getFieldError('clientName')
                          ? 'border-red-400 focus:ring-red-300'
                          : fieldTouched.clientName && !getFieldError('clientName') && bookingFormData.clientName
                          ? 'border-green-400 focus:ring-green-300'
                          : 'border-gray-300 focus:ring-studio-green'
                      }`}
                      placeholder="Your full name"
                    />
                    {getFieldError('clientName') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('clientName')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="clientEmail"
                      name="clientEmail"
                      value={bookingFormData.clientEmail}
                      onChange={handleFormChange}
                      onBlur={() => handleFieldBlur('clientEmail')}
                      className={`w-full px-4 py-3 border transition-colors duration-200 focus:ring-2 focus:border-transparent ${
                        getFieldError('clientEmail')
                          ? 'border-red-400 focus:ring-red-300'
                          : fieldTouched.clientEmail && !getFieldError('clientEmail') && bookingFormData.clientEmail
                          ? 'border-green-400 focus:ring-green-300'
                          : 'border-gray-300 focus:ring-studio-green'
                      }`}
                      placeholder="your@email.com"
                    />
                    {getFieldError('clientEmail') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('clientEmail')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="clientPhone"
                      name="clientPhone"
                      value={bookingFormData.clientPhone}
                      onChange={handleFormChange}
                      onBlur={() => handleFieldBlur('clientPhone')}
                      className={`w-full px-4 py-3 border transition-colors duration-200 focus:ring-2 focus:border-transparent ${
                        getFieldError('clientPhone')
                          ? 'border-red-400 focus:ring-red-300'
                          : fieldTouched.clientPhone && !getFieldError('clientPhone') && bookingFormData.clientPhone
                          ? 'border-green-400 focus:ring-green-300'
                          : 'border-gray-300 focus:ring-studio-green'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {getFieldError('clientPhone') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('clientPhone')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                      <Camera className="h-4 w-4 inline mr-2" />
                      Project Type <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={bookingFormData.projectType}
                      onChange={handleFormChange}
                      onBlur={() => handleFieldBlur('projectType')}
                      className={`w-full px-4 py-3 border transition-colors duration-200 focus:ring-2 focus:border-transparent ${
                        getFieldError('projectType')
                          ? 'border-red-400 focus:ring-red-300'
                          : fieldTouched.projectType && !getFieldError('projectType') && bookingFormData.projectType
                          ? 'border-green-400 focus:ring-green-300'
                          : 'border-gray-300 focus:ring-studio-green'
                      }`}
                    >
                      <option value="">Select project type (optional)</option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {getFieldError('projectType') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('projectType')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={bookingFormData.notes}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-studio-green focus:border-transparent transition-colors duration-200"
                    placeholder="Any special requirements, setup needs, etc."
                  />
                </div>

                {submitError && (
                  <div className="bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-800 font-semibold">Booking failed</p>
                      <p className="text-red-600 text-sm mt-1">{submitError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitError(null)}
                      className="text-red-400 hover:text-red-600"
                      aria-label="Dismiss error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="sm:flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back to time
                  </button>
                  <button
                    type="submit"
                    disabled={!agreedToTerms || isSubmitting}
                    className={`sm:flex-1 py-3 px-6 font-heading font-black uppercase transition-colors duration-200 flex items-center justify-center gap-2 ${
                      !agreedToTerms || isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-studio-green text-white hover:bg-studio-green-darker cursor-pointer'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : agreedToTerms ? (
                      `Continue to payment · $${price.total}`
                    ) : (
                      'Agree to terms to continue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Stripe Payment Modal */}
      {confirmedBookingDetails && (
        <StripePaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          onPaymentSuccess={handlePaymentSuccess}
          amount={confirmedBookingDetails.totalPrice}
          clientEmail={confirmedBookingDetails.clientEmail}
          description={`Studio Rental – ${confirmedBookingDetails.date} ${confirmedBookingDetails.startTime}–${confirmedBookingDetails.endTime}`}
          bookingData={{
            date: confirmedBookingDetails.date,
            startTime: confirmedBookingDetails.startTime,
            endTime: confirmedBookingDetails.endTime,
            duration: confirmedBookingDetails.duration,
            clientName: confirmedBookingDetails.clientName,
            clientEmail: confirmedBookingDetails.clientEmail,
            clientPhone: confirmedBookingDetails.clientPhone,
            projectType: confirmedBookingDetails.projectType,
            totalPrice: confirmedBookingDetails.totalPrice,
            notes: confirmedBookingDetails.notes,
            agreedToTerms: confirmedBookingDetails.agreedToTerms,
            termsAgreedAt: confirmedBookingDetails.termsAgreedAt,
          }}
          stripePublishableKey={stripePublishableKey}
        />
      )}

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseConfirmationModal}
        bookingDetails={confirmedBookingDetails}
      />

      {/* Mobile sticky CTA — shows when a date is picked and we're not in the form/payment step */}
      {selectedDate && !showBookingForm && !showPaymentModal && !showConfirmationModal && (
        <MobileBookingBar
          dateLabel={selectedDateLabel}
          timeLabel={selectedTimeLabel}
          priceTotal={price.total}
          disabled={!isBookingValid()}
          disabledReason={mobileBarDisabledReason}
          agreedToTerms={agreedToTerms}
          onContinue={handleProceedToBooking}
        />
      )}
    </section>
  );
};

export default Calendar;