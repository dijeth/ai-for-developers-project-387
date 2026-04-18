import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const ADMIN_TZ = 'Europe/Moscow';

/**
 * Test data generators for E2E tests
 *
 * Provides factory functions for creating test data.
 */

/**
 * Generate a unique email address for test guests
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `${prefix}_${timestamp}_${random}@example.com`
}

/**
 * Generate a unique name for test guests
 */
export function generateTestName(prefix = 'Test User'): string {
  const random = Math.floor(Math.random() * 10000)
  return `${prefix} ${random}`
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrow(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

/**
 * Get next weekday (Mon-Fri) from a given date
 */
export function getNextWeekday(from: Date): Date {
  const adminNow = dayjs(from).tz(ADMIN_TZ);
  return adminNow.day() >= 0 && adminNow.day() < 5
    ? adminNow.add(1, 'day').startOf('day').utc().toDate()
    : adminNow.endOf('week')
      .add(2, 'day') // add two days to get to Monday (because endOf('week') gives us Saturday)
      .startOf('day')
      .utc().toDate();
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format date to ISO string for API
 */
export function toISODateTime(date: Date): string {
  return date.toISOString()
}

/**
 * Create date at specific hour in UTC
 */
export function createDateAtHour(date: Date, hour: number, minute = 0): Date {
  return dayjs(date)
    .add(hour, 'hour')
    .add(minute, 'minute')
    .utc()
    .toDate();
}

/**
 * Default test event types for seeding
 */
export const DEFAULT_EVENT_TYPES = [
  {
    title: 'E2E Test Consultation',
    durationMinutes: 15,
    description: 'Quick test consultation for E2E tests',
  },
  {
    title: 'E2E Test Code Review',
    durationMinutes: 30,
    description: 'Code review session for E2E tests',
  },
  {
    title: 'E2E Test Architecture',
    durationMinutes: 60,
    description: 'Architecture discussion for E2E tests',
  },
] as const
