/**
 * Single source of truth for studio operating hours.
 *
 * To change hours in the future: update OPENING_HOUR_24 / CLOSING_HOUR_24 here
 * and the rest of the app (Calendar, AdminBookingsPage, validation, copy)
 * will follow. Do NOT forget to also sync index.html JSON-LD `openingHoursSpecification`
 * since that file is plain HTML and cannot import from TS.
 */

export const OPENING_HOUR_24 = 8; // 08:00
export const CLOSING_HOUR_24 = 22; // 22:00 = 10 PM
export const MIN_BOOKING_HOURS = 2;

const formatHourLabel = (hour24: number): string => {
  const period = hour24 >= 12 && hour24 < 24 ? 'PM' : 'AM';
  const display = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${display}:00 ${period}`;
};

const formatShortHourLabel = (hour24: number): string => {
  const period = hour24 >= 12 && hour24 < 24 ? 'PM' : 'AM';
  const display = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${display} ${period}`;
};

export const OPENING_LABEL = formatHourLabel(OPENING_HOUR_24);
export const CLOSING_LABEL = formatHourLabel(CLOSING_HOUR_24);

/** Compact label for headers (e.g. "8 AM – 10 PM"). */
export const HOURS_RANGE_LABEL = `${formatShortHourLabel(OPENING_HOUR_24)} – ${formatShortHourLabel(CLOSING_HOUR_24)}`;

/**
 * Hourly time slots from opening to closing, inclusive.
 *
 * The closing slot ("10:00 PM") is rendered as a selectable end time only —
 * it cannot be picked as a start time because there's no room for the 2-hour
 * minimum after it. The Calendar's `canSelectStartTime` enforces this.
 */
export const TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = OPENING_HOUR_24; h <= CLOSING_HOUR_24; h += 1) {
    out.push(formatHourLabel(h));
  }
  return out;
})();
