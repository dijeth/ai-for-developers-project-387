/**
 * UTC Date Utilities
 *
 * All dates in this backend are handled in UTC only.
 * These utilities enforce UTC-only operations and prevent accidental
 * usage of local time methods.
 *
 * RULES:
 * 1. Always use `utcNow()` instead of `new Date()` to get current time
 * 2. Always use UTC-specific methods (.getUTC*(), .setUTC*())
 * 3. Never use local time methods (.getHours(), .setDate(), etc.)
 */

export {
  addUTCDays,
  addUTCMonths,
  convertLocalTimeToUTC,
  endOfUTCDay,
  formatUTCDate,
  formatUTCTime,
  fromISO,
  getDayOfWeekInTimezone,
  getUTCDate,
  getUTCDay,
  getUTCHours,
  getUTCMinutes,
  getUTCMonth,
  getUTCYear,
  isUTCAfter,
  isUTCBefore,
  isUTCFuture,
  isUTCPast,
  isSameUTCDay,
  setUTCDate,
  setUTCHours,
  startOfUTCDay,
  startOfUTCWeek,
  toISO,
  utcNow,
} from '@calendar/date-utils';
