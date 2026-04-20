import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export type DateTimeType = {
  month: number;
  day: number;
  hour: number;
  minute: number;
};

// We seeded the database with these parameters:
// - admin user in the "Europe/Moscow" timezone
// - working days: Mon-Fri
// - working hours from 9:00 to 17:00 in admin's timezone
// - event types with durations 15, 30, 60 and 120 minutes

export const ADMIN_TZ = "Europe/Moscow";
export const workingHours = {
  Sunday: null,
  Monday: { start: 9, end: 17 },
  Tuesday: { start: 9, end: 17 },
  Wednesday: { start: 9, end: 17 },
  Thursday: { start: 9, end: 17 },
  Friday: { start: 9, end: 17 },
  Saturday: null,
} as const;

const weekDayIndex = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const;

/**
 * Test data generators for E2E tests
 *
 * Provides factory functions for creating test data.
 */

/**
 * Generate a unique email address for test guests
 */
export function generateTestEmail(prefix = "test"): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}@example.com`;
}

/**
 * Generate a unique name for test guests
 */
export function generateTestName(prefix = "Test User"): string {
  const random = Math.floor(Math.random() * 10000);
  return `${prefix} ${random}`;
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrow(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

/**
 * Get the next weekday (Monday-Friday) from the given date
 * If the given date is Saturday or Sunday, returns the following Monday
 */
export function getNextWeekday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Sunday, 1-5 = Mon-Fri, 6 = Saturday

  if (day === 0) {
    // Sunday -> Monday (add 1 day)
    result.setDate(result.getDate() + 1);
  } else if (day === 6) {
    // Saturday -> Monday (add 2 days)
    result.setDate(result.getDate() + 2);
  } else {
    // Monday-Friday -> next day (add 1 day)
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/*
  Get the next working day interval (start and end time) in both admin and client timezones
*/
export function getNextDayWorkingInterval(
  from: Date,
  adminTZ: string,
  clientTZ: string,
): {
  from: { iso: string; adminSide: DateTimeType; clientSide: DateTimeType };
  to: { iso: string; adminSide: DateTimeType; clientSide: DateTimeType };
} {
  const adminNow = dayjs.tz(from, adminTZ);
  const adminNextWorkingDay =
    adminNow.day() >= 5
      ? adminNow.endOf("week").add(1, "day")
      : adminNow.add(1, "day");

  const { start, end } =
    workingHours[
      adminNextWorkingDay.format("dddd") as keyof typeof workingHours
    ]!;
  const adminStart = adminNextWorkingDay.hour(start).minute(0).second(0);
  const adminEnd = adminNextWorkingDay.hour(end).minute(0).second(0);

  const clientStart = adminStart.clone().tz(clientTZ);
  const clientEnd = adminEnd.clone().tz(clientTZ);

  return {
    from: {
      iso: adminStart.toISOString(),
      adminSide: {
        month: adminStart.month() + 1,
        day: adminStart.date(),
        hour: adminStart.hour(),
        minute: adminStart.minute(),
      },
      clientSide: {
        month: clientStart.month() + 1,
        day: clientStart.date(),
        hour: clientStart.hour(),
        minute: clientStart.minute(),
      },
    },
    to: {
      iso: adminEnd.toISOString(),
      adminSide: {
        month: adminEnd.month() + 1,
        day: adminEnd.date(),
        hour: adminEnd.hour(),
        minute: adminEnd.minute(),
      },
      clientSide: {
        month: clientEnd.month() + 1,
        day: clientEnd.date(),
        hour: clientEnd.hour(),
        minute: clientEnd.minute(),
      },
    },
  };
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Format date to ISO string for API
 */
export function toISODateTime(date: Date): string {
  return date.toISOString();
}

/**
 * Create date at specific hour in UTC
 */
export function createDateAtHour(date: Date, hour: number, minute = 0): Date {
  return dayjs(date).add(hour, "hour").add(minute, "minute").utc().toDate();
}

/**
 * Default test event types for seeding
 */
export const DEFAULT_EVENT_TYPES = [
  {
    title: "E2E Test Consultation",
    durationMinutes: 15,
    description: "Quick test consultation for E2E tests",
  },
  {
    title: "E2E Test Code Review",
    durationMinutes: 30,
    description: "Code review session for E2E tests",
  },
  {
    title: "E2E Test Architecture",
    durationMinutes: 60,
    description: "Architecture discussion for E2E tests",
  },
] as const;
