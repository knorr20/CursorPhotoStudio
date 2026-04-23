export const getTimeValue = (timeString: string): number => {
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

export const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
};

export const calculateDuration = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return { hours: 0, minutes: 0, text: '' };
  
  const startValue = getTimeValue(startTime);
  const endValue = getTimeValue(endTime);
  
  if (endValue <= startValue) return { hours: 0, minutes: 0, text: '' };
  
  const durationMinutes = endValue - startValue;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  let text = '';
  if (hours === 0) {
    text = `${minutes} minutes`;
  } else if (minutes === 0) {
    text = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    text = `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
  }
  
  return { hours, minutes, text };
};

export const calculatePrice = (date: string, startTime: string, endTime: string) => {
  if (!date || !startTime || !endTime) return { total: 0, hourlyRate: 0, breakdown: '' };
  
  const duration = calculateDuration(startTime, endTime);
  const totalHours = duration.hours + (duration.minutes / 60);
  
  if (totalHours < 2) return { total: 0, hourlyRate: 0, breakdown: 'Minimum 2 hours required' };
  
  const weekend = isWeekend(date);
  
  let hourlyRate = 0;
  let breakdown = '';
  
  if (totalHours >= 5) {
    // 5+ hours discount
    hourlyRate = weekend ? 50 : 40;
    breakdown = `${totalHours.toFixed(1)} hours × $${hourlyRate}/hour (5+ hours rate)`;
  } else {
    // 2-4 hours regular rate
    hourlyRate = weekend ? 60 : 50;
    breakdown = `${totalHours.toFixed(1)} hours × $${hourlyRate}/hour (2-4 hours rate)`;
  }
  
  const total = Math.round(totalHours * hourlyRate);
  
  return { total, hourlyRate, breakdown };
};

export const checkBookingOverlap = (targetBooking: { date: string; startTime: string; endTime: string; id: number }, allBookings: Array<{ id: number; date: string; startTime: string; endTime: string; status: string }>) => {
  const targetStartTime = getTimeValue(targetBooking.startTime);
  const targetEndTime = getTimeValue(targetBooking.endTime);
  
  // Check for overlaps with other bookings on the same date
  const conflictingBooking = allBookings.find(booking => {
    // Skip the target booking itself and cancelled bookings
    if (booking.id === targetBooking.id || booking.status === 'cancelled') {
      return false;
    }
    
    // Only confirmed bookings block time slots.
    if (booking.date !== targetBooking.date || booking.status !== 'confirmed') {
      return false;
    }
    
    const bookingStartTime = getTimeValue(booking.startTime);
    const bookingEndTime = getTimeValue(booking.endTime);
    
    // Check for time overlap
    // Two time ranges overlap if: start1 < end2 AND start2 < end1
    return targetStartTime < bookingEndTime && bookingStartTime < targetEndTime;
  });
  
  return conflictingBooking || null;
};