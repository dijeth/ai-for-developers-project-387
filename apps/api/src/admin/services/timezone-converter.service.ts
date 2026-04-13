import { Injectable } from '@nestjs/common';
import { Weekday } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import {
  convertLocalTimeToUTC,
  startOfUTCDay,
  addUTCDays,
  utcNow,
  formatUTCDate,
} from '@calendar/date-utils';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface WorkingHoursEntry {
  weekday: Weekday;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface AdjustedWorkingHours {
  weekday: Weekday;
  startTime: string; // HH:MM, clamped to 00:00-23:59
  endTime: string; // HH:MM, clamped to 00:00-23:59
}

export interface ClippedInterval {
  start: Date; // UTC
  end: Date; // UTC
}

export interface TimezoneConversionResult {
  adjustedHours: AdjustedWorkingHours[];
  clippedIntervals: ClippedInterval[];
}

@Injectable()
export class TimezoneConverterService {
  /**
   * Converts working hours from old timezone to new timezone.
   * The weekday stays the same, only times are adjusted.
   * Times that fall outside 00:00-23:59 are clamped to day bounds.
   *
   * Algorithm:
   * 1. For each working hours entry, take the local time in old timezone
   * 2. Convert to UTC to get the actual moment in time
   * 3. See what local time it corresponds to in the new timezone
   * 4. If the day of week changed, that means the time "spilled over" to another day
   * 5. Clamp times to 00:00-23:59 bounds
   * 6. Track clipped intervals for conflict checking
   */
  convertWorkingHoursToNewTimezone(
    workingHours: WorkingHoursEntry[],
    oldTimezone: string,
    newTimezone: string,
  ): TimezoneConversionResult {
    const adjustedHours: AdjustedWorkingHours[] = [];
    const clippedIntervals: ClippedInterval[] = [];

    // Use a reference date (start of current week)
    const referenceDate = startOfUTCDay(utcNow());

    for (const entry of workingHours) {
      const originalDayIndex = this.weekdayToIndex(entry.weekday);

      // Get a date that falls on this weekday in old timezone
      const oldLocalDate = this.getDateForWeekday(referenceDate, originalDayIndex, oldTimezone);

      // Convert old local times to UTC
      const startUTC = convertLocalTimeToUTC(oldLocalDate, entry.startTime, oldTimezone);
      const endUTC = convertLocalTimeToUTC(oldLocalDate, entry.endTime, oldTimezone);

      // Get the corresponding local times in new timezone
      const newStartLocal = dayjs(startUTC).tz(newTimezone);
      const newEndLocal = dayjs(endUTC).tz(newTimezone);

      // Get new day indices
      const newStartDayIndex = newStartLocal.day();
      const newEndDayIndex = newEndLocal.day();

      // Format new times as HH:MM
      const newStartTime = newStartLocal.format('HH:mm');
      const newEndTime = newEndLocal.format('HH:mm');

      // Calculate clipped intervals before clamping
      const entryClipped = this.calculateClippedIntervals(
        startUTC,
        endUTC,
        newStartLocal,
        newEndLocal,
        originalDayIndex,
        newTimezone,
      );
      clippedIntervals.push(...entryClipped);

      // Only keep working hours if at least some part falls on the original weekday
      // and the times form a valid range
      if (newStartDayIndex === originalDayIndex && newEndDayIndex === originalDayIndex) {
        // Both start and end are on the same day - use as is
        if (newStartTime < newEndTime) {
          adjustedHours.push({
            weekday: entry.weekday,
            startTime: newStartTime,
            endTime: newEndTime,
          });
        }
      } else if (newStartDayIndex === originalDayIndex && newEndDayIndex !== originalDayIndex) {
        // Start is on original day, end spilled to next day - clamp end to 23:59
        adjustedHours.push({
          weekday: entry.weekday,
          startTime: newStartTime,
          endTime: '23:59',
        });
      } else if (newStartDayIndex !== originalDayIndex && newEndDayIndex === originalDayIndex) {
        // End is on original day, start spilled from previous day - clamp start to 00:00
        if (newEndTime > '00:00') {
          adjustedHours.push({
            weekday: entry.weekday,
            startTime: '00:00',
            endTime: newEndTime,
          });
        }
      }
      // If both spilled to different days, the entire working hours are lost
    }

    return { adjustedHours, clippedIntervals };
  }

  /**
   * Calculate intervals that were "clipped" (removed) from working hours
   * due to falling outside the original weekday after timezone conversion.
   */
  private calculateClippedIntervals(
    originalStartUTC: Date,
    originalEndUTC: Date,
    newStartLocal: dayjs.Dayjs,
    newEndLocal: dayjs.Dayjs,
    originalDayIndex: number,
    newTimezone: string,
  ): ClippedInterval[] {
    const clipped: ClippedInterval[] = [];

    const newStartDayIndex = newStartLocal.day();
    const newEndDayIndex = newEndLocal.day();

    // Check if start spilled to previous day
    if (newStartDayIndex !== originalDayIndex) {
      // The interval from original start to midnight of the new day is clipped
      const newDayStartUTC = newStartLocal.clone().startOf('day').utc().toDate();
      if (originalStartUTC < newDayStartUTC) {
        clipped.push({
          start: originalStartUTC,
          end: newDayStartUTC,
        });
      }
    }

    // Check if end spilled to next day
    if (newEndDayIndex !== originalDayIndex) {
      // The interval from midnight to original end is clipped
      const originalDayEndUTC = newEndLocal.clone().startOf('day').utc().toDate();
      if (originalEndUTC > originalDayEndUTC) {
        clipped.push({
          start: originalDayEndUTC,
          end: originalEndUTC,
        });
      }
    }

    // Also check if times are outside 00:00-23:59 on the same day
    // (though dayjs format should always give valid times)
    const newStartTime = newStartLocal.format('HH:mm');
    const newEndTime = newEndLocal.format('HH:mm');

    if (newStartDayIndex === originalDayIndex && newStartTime === '00:00' && originalStartUTC < newStartLocal.clone().startOf('day').utc().toDate()) {
      // Start was clamped to 00:00
      const dayStart = newStartLocal.clone().startOf('day').utc().toDate();
      if (originalStartUTC < dayStart) {
        clipped.push({
          start: originalStartUTC,
          end: dayStart,
        });
      }
    }

    return clipped;
  }

  /**
   * Get a date (at midnight UTC) that corresponds to a specific weekday
   * in a specific timezone, relative to a reference date.
   */
  private getDateForWeekday(
    referenceDate: Date,
    targetWeekdayIndex: number,
    timeZone: string,
  ): Date {
    // Get the weekday of the reference date in the target timezone
    const refWeekday = dayjs(referenceDate).tz(timeZone).day();

    // Calculate days difference
    let daysDiff = targetWeekdayIndex - refWeekday;
    if (daysDiff < 0) {
      daysDiff += 7;
    }

    return addUTCDays(referenceDate, daysDiff);
  }

  /**
   * Convert weekday enum to numeric index (0=Sun, 1=Mon, ..., 6=Sat)
   */
  private weekdayToIndex(weekday: Weekday): number {
    const mapping: Record<Weekday, number> = {
      [Weekday.sun]: 0,
      [Weekday.mon]: 1,
      [Weekday.tue]: 2,
      [Weekday.wed]: 3,
      [Weekday.thu]: 4,
      [Weekday.fri]: 5,
      [Weekday.sat]: 6,
    };
    return mapping[weekday];
  }

  /**
   * Convert numeric index to weekday enum
   */
  indexToWeekday(index: number): Weekday {
    const mapping: Record<number, Weekday> = {
      0: Weekday.sun,
      1: Weekday.mon,
      2: Weekday.tue,
      3: Weekday.wed,
      4: Weekday.thu,
      5: Weekday.fri,
      6: Weekday.sat,
    };
    return mapping[index];
  }

  /**
   * Check if any bookings overlap with the clipped intervals.
   * Returns array of conflicting bookings.
   */
  findConflictingBookings(
    bookings: Array<{ startTime: Date; endTime: Date }>,
    clippedIntervals: ClippedInterval[],
  ): Array<{ startTime: Date; endTime: Date }> {
    const conflicts: Array<{ startTime: Date; endTime: Date }> = [];

    for (const booking of bookings) {
      for (const interval of clippedIntervals) {
        // Check if booking overlaps with clipped interval
        // Booking overlaps if: booking.start < interval.end AND booking.end > interval.start
        if (
          booking.startTime < interval.end &&
          booking.endTime > interval.start
        ) {
          conflicts.push(booking);
          break; // Don't add the same booking multiple times
        }
      }
    }

    return conflicts;
  }
}
