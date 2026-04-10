import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OwnerService } from '../../prisma/models/owner.service';
import { EventTypeService } from '../../prisma/models/event-type.service';
import { BookingService } from '../../prisma/models/booking.service';
import { TimeOffService } from '../../prisma/models/time-off.service';
import { AvailableSlotDto } from '../../dto/slot/available-slot.dto';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { TimeInterval, generateSlotsFromGaps } from '../../common/utils/slot.utils';
import {
  addUTCDays,
  addUTCMonths,
  convertLocalTimeToUTC,
  fromISO,
  getDayOfWeekInTimezone,
  isUTCAfter,
  isUTCBefore,
  isSameUTCDay,
  startOfUTCDay,
  utcNow,
} from '@calendar/date-utils';

@Injectable()
export class AvailableSlotsService {
  private readonly ownerId = 'owner';

  constructor(
    private ownerService: OwnerService,
    private eventTypeService: EventTypeService,
    private bookingService: BookingService,
    private timeOffService: TimeOffService,
  ) {}

  async getAvailableSlots(
    eventTypeId: string,
    startDateStr: string,
    endDateStr: string,
  ): Promise<AvailableSlotDto[]> {
    // Validate event type exists
    const eventType = await this.eventTypeService.findOne(eventTypeId);
    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    // Parse dates
    const startDate = this.parseDate(startDateStr);
    const endDate = this.parseDate(endDateStr);

    // Get owner data
    const owner = await this.ownerService.findOne(this.ownerId);
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // Validate the requested date range
    this.validateDateRange(startDate, endDate, owner.bookingMonthsAhead);

    // Get bookings and time-offs that overlap with the requested range
    const bookings = await this.bookingService.findInRange(startDate, endDate);
    const allTimeOffs = await this.timeOffService.findAll(this.ownerId);
    // Filter time-offs that overlap with the requested range
    const timeOffs = allTimeOffs.filter(
      (to) => to.startDateTime < endDate && to.endDateTime > startDate,
    );

    // Generate available slots for the range
    const now = utcNow();
    const slots = this.generateSlotsForRange(
      startDate,
      endDate,
      owner,
      eventType.durationMinutes,
      bookings,
      timeOffs,
      now,
    );

    return slots;
  }

  private parseDate(dateStr: string): Date {
    const date = fromISO(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${dateStr}`);
    }
    return date;
  }

  private validateDateRange(startDate: Date, endDate: Date, bookingMonthsAhead: number): void {
    // Check that startDate is not after endDate
    if (isUTCBefore(endDate, startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const today = startOfUTCDay(utcNow());

    // Check that startDate is not in the past
    if (isUTCBefore(startDate, today)) {
      throw new BadRequestException('Start date must be today or in the future');
    }

    // Calculate max allowed date: today + bookingMonthsAhead months
    const maxAllowedDate = addUTCMonths(today, bookingMonthsAhead);

    // Both startDate and endDate must be within the allowed range
    if (isUTCBefore(maxAllowedDate, endDate)) {
      throw new BadRequestException(
        `Date range must be within ${bookingMonthsAhead} months from today`,
      );
    }
  }

  private generateSlotsForRange(
    startDate: Date,
    endDate: Date,
    owner: {
      workingDays: DayOfWeek[];
      workingHoursStart: string;
      workingHoursEnd: string;
      timezone: string;
    },
    durationMinutes: number,
    bookings: Array<{ startTime: Date; endTime: Date }>,
    timeOffs: Array<{ startDateTime: Date; endDateTime: Date }>,
    now: Date,
  ): AvailableSlotDto[] {
    const allSlots: AvailableSlotDto[] = [];

    // Iterate through each day in the range
    let currentDate = startOfUTCDay(startDate);
    const rangeEnd = endDate;

    while (isUTCBefore(currentDate, rangeEnd) || isSameUTCDay(currentDate, rangeEnd)) {
      // Check if this day is a working day (using owner's timezone)
      const dayOfWeekNum = getDayOfWeekInTimezone(currentDate, owner.timezone);
      const dayOfWeek = this.numberToDayOfWeek(dayOfWeekNum);
      if (owner.workingDays.includes(dayOfWeek)) {
        // Calculate working hours for this day in owner's timezone, converted to UTC
        const dayWorkingStart = convertLocalTimeToUTC(currentDate, owner.workingHoursStart, owner.timezone);
        const dayWorkingEnd = convertLocalTimeToUTC(currentDate, owner.workingHoursEnd, owner.timezone);

        // Clamp working hours to the requested range
        const effectiveStart = isUTCAfter(dayWorkingStart, startDate)
          ? dayWorkingStart
          : startDate;
        const effectiveEnd = isUTCBefore(dayWorkingEnd, endDate) ? dayWorkingEnd : endDate;

        // Only process if there's a valid working window
        if (isUTCBefore(effectiveStart, effectiveEnd)) {
          // Get busy intervals that overlap with this day's working hours
          const busyIntervals = this.getBusyIntervalsForRange(
            effectiveStart,
            effectiveEnd,
            bookings,
            timeOffs,
          );

          // Generate available slots from gaps
          const slots = generateSlotsFromGaps(effectiveStart, effectiveEnd, busyIntervals, durationMinutes);

          // Filter out slots that have already started and add to result
          for (const slot of slots) {
            const slotStart = fromISO(slot.startTime);
            if (isUTCAfter(slotStart, now)) {
              allSlots.push(slot);
            }
          }
        }
      }

      // Move to next day
      currentDate = addUTCDays(currentDate, 1);
    }

    return allSlots;
  }
  private numberToDayOfWeek(dayNum: number): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUN,
      DayOfWeek.MON,
      DayOfWeek.TUE,
      DayOfWeek.WED,
      DayOfWeek.THU,
      DayOfWeek.FRI,
      DayOfWeek.SAT,
    ];
    return days[dayNum];
  }

  private getBusyIntervalsForRange(
    rangeStart: Date,
    rangeEnd: Date,
    bookings: Array<{ startTime: Date; endTime: Date }>,
    timeOffs: Array<{ startDateTime: Date; endDateTime: Date }>,
  ): TimeInterval[] {
    const busy: TimeInterval[] = [];

    // Add bookings that overlap with this range
    for (const booking of bookings) {
      if (booking.startTime < rangeEnd && booking.endTime > rangeStart) {
        busy.push({
          start: new Date(Math.max(booking.startTime.getTime(), rangeStart.getTime())),
          end: new Date(Math.min(booking.endTime.getTime(), rangeEnd.getTime())),
        });
      }
    }

    // Add time-offs that overlap with this range
    for (const to of timeOffs) {
      if (to.startDateTime < rangeEnd && to.endDateTime > rangeStart) {
        busy.push({
          start: new Date(Math.max(to.startDateTime.getTime(), rangeStart.getTime())),
          end: new Date(Math.min(to.endDateTime.getTime(), rangeEnd.getTime())),
        });
      }
    }

    // Sort and merge overlapping intervals
    return this.mergeOverlappingIntervals(busy);
  }

  private mergeOverlappingIntervals(intervals: TimeInterval[]): TimeInterval[] {
    if (intervals.length === 0) return [];

    // Sort by start time
    const sorted = intervals.sort((a, b) => a.start.getTime() - b.start.getTime());
    const merged: TimeInterval[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      const current = sorted[i];

      // Check for overlap (including touching intervals)
      if (current.start <= last.end) {
        // Merge: extend end time if current ends later
        if (current.end > last.end) {
          last.end = current.end;
        }
      } else {
        merged.push(current);
      }
    }

    return merged;
  }
}
