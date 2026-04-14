import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { fromISO, utcNow } from '@calendar/date-utils';

// Enable plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Frontend UTC Date Utilities
 *
 * IMPORTANT: All communication with backend must use UTC.
 * These utilities help convert local browser time to UTC for API calls.
 *
 * RULES:
 * 1. Calendar/UI shows dates in local time (browser default)
 * 2. API calls use UTC strings (use toUTCDateString())
 * 3. Dates from API are parsed as UTC (use fromISO())
 *
 * Flow:
 * - Client selects date in Calendar (local timezone)
 * - toUTCDateString(): start of day in local TZ -> convert to UTC ISO
 * - toUTCEndOfDayString(): end of day in local TZ -> convert to UTC ISO
 * - API call with UTC ISO strings
 */

/**
 * Converts a local Date to UTC ISO string for start of day.
 * Returns YYYY-MM-DDTHH:mm:ss.sssZ format in UTC.
 *
 * Logic:
 * 1. Take the date selected by client in their local timezone
 * 2. Set time to start of day (00:00:00) in local timezone
 * 3. Convert to UTC and return ISO string
 *
 * Example: client in Perm (+5) selects April 10
 *   -> local start: Apr 10 00:00:00 GMT+0500
 *   -> UTC: Apr 9 19:00:00 GMT+0000
 *   -> returns "2025-04-09T19:00:00.000Z"
 */
export function toUTCDateString(date: Date): string {
  return dayjs(date)
    .startOf('day')
    .utc()
    .toISOString();
}

/**
 * Converts a local Date to UTC ISO string for end of day.
 * Returns YYYY-MM-DDTHH:mm:ss.sssZ format in UTC.
 *
 * Logic:
 * 1. Take the date selected by client in their local timezone
 * 2. Set time to end of day (23:59:59.999) in local timezone
 * 3. Convert to UTC and return ISO string
 *
 * Example: client in Perm (+5) selects April 10
 *   -> local end: Apr 10 23:59:59.999 GMT+0500
 *   -> UTC: Apr 10 18:59:59.999 GMT+0000
 *   -> returns "2025-04-10T18:59:59.999Z"
 */
export function toUTCEndOfDayString(date: Date): string {
  return dayjs(date)
    .endOf('day')
    .utc()
    .toISOString();
}

export { fromISO, utcNow };

/**
 * Formats a date for local display (uses browser timezone).
 */
export function formatLocalDate(date: Date, locale = 'ru-RU'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Formats time for local display from ISO string.
 */
export function formatLocalTime(isoString: string, locale = 'ru-RU'): string {
  const date = fromISO(isoString);
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats date+time for local display from ISO string.
 */
export function formatLocalDateTime(isoString: string, locale = 'ru-RU'): string {
  const date = fromISO(isoString);
  return date.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a long date for local display.
 */
export function formatLongDate(date: Date, locale = 'ru-RU'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

/**
 * Formats a time range (start - end) for display.
 */
export function formatTimeRange(startISO: string, endISO: string, locale = 'ru-RU'): string {
  const start = fromISO(startISO);
  const end = fromISO(endISO);
  const startStr = start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const endStr = end.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return `${startStr} - ${endStr}`;
}

/**
 * Adds months to a date.
 */
export function addMonths(date: Date, months: number): Date {
  return dayjs(date).add(months, 'month').toDate();
}

/**
 * Checks if two dates are the same local day.
 */
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day');
}

/**
 * Gets the start of local week (Sunday).
 */
export function startOfLocalWeek(date: Date): Date {
  return dayjs(date).startOf('week').toDate();
}

/**
 * Gets the end of local week (Saturday).
 */
export function endOfLocalWeek(date: Date): Date {
  return dayjs(date).endOf('week').toDate();
}

/**
 * Gets the start of local month.
 */
export function startOfLocalMonth(date: Date): Date {
  return dayjs(date).startOf('month').toDate();
}

/**
 * Gets the end of local month.
 */
export function endOfLocalMonth(date: Date): Date {
  return dayjs(date).endOf('month').toDate();
}

/**
 * Gets the start of local day.
 */
export function startOfLocalDay(date: Date): Date {
  return dayjs(date).startOf('day').toDate();
}

/**
 * Gets day of week (0-6) for local timezone.
 */
export function getLocalDayOfWeek(date: Date): number {
  return dayjs(date).day();
}

/**
 * Gets month date range (first and last day) and converts to UTC ISO strings.
 * Used for calendar month-change API calls.
 *
 * @param date - Any date within the target month (typically from calendar's month-change event)
 * @returns Object with dateFrom (start of month UTC) and dateTo (end of month UTC)
 *
 * Example:
 *   getMonthDateRange(new Date(2025, 3, 1)) // April 2025
 *   // Returns:
 *   // {
 *   //   dateFrom: "2025-03-31T21:00:00.000Z", // for MSK+3
 *   //   dateTo: "2025-04-30T20:59:59.999Z"
 *   // }
 */
export function getMonthDateRange(date: Date): { dateFrom: string; dateTo: string } {
  const d = dayjs(date);
  const startOfMonth = d.startOf('month');
  const endOfMonth = d.endOf('month');

  return {
    dateFrom: startOfMonth.utc().toISOString(),
    dateTo: endOfMonth.utc().toISOString()
  };
}

// ============================================================================
// Timezone-specific utilities for Admin (using owner's timezone)
// ============================================================================

/**
 * Gets month date range in admin's timezone, returns UTC ISO strings.
 *
 * Logic:
 * 1. Take the date (represents a month in admin's calendar)
 * 2. Get first day of that month in admin's timezone
 * 3. Get last day of that month in admin's timezone  
 * 4. Convert both to UTC ISO strings
 *
 * Example: admin in Moscow (+3), viewing April 2025
 *   -> First day: Apr 1 00:00:00 MSK = "2025-03-31T21:00:00.000Z"
 *   -> Last day: Apr 30 23:59:59.999 MSK = "2025-04-30T20:59:59.999Z"
 */
export function getMonthDateRangeInTimezone(
  date: Date,
  timezone: string
): { dateFrom: string; dateTo: string } {
  // Create dayjs object in admin's timezone
  const adminDate = dayjs(date).tz(timezone);
  
  // Get first day of month in admin's timezone
  const startOfMonth = adminDate.startOf('month');
  
  // Get last day of month in admin's timezone
  const endOfMonth = adminDate.endOf('month');
  
  return {
    dateFrom: startOfMonth.utc().toISOString(),
    dateTo: endOfMonth.utc().toISOString()
  };
}
