import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OwnerService } from '../../prisma/models/owner.service';
import { EventTypeService } from '../../prisma/models/event-type.service';
import { BookingService } from '../../prisma/models/booking.service';
import { TimeOffService } from '../../prisma/models/time-off.service';
import { AvailableSlotDto } from '../../dto/slot/available-slot.dto';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';

interface TimeInterval {
  start: Date;
  end: Date;
}

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

    // Validate date range
    this.validateDateRange(startDate, endDate);

    // Get owner data
    const owner = await this.ownerService.findOne(this.ownerId);
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // Validate against bookingMonthsAhead
    this.validateBookingMonthsAhead(startDate, endDate, owner.bookingMonthsAhead);

    // Get all bookings and time-offs in the range
    const bookings = await this.bookingService.findInRange(startDate, endDate);
    const timeOffs = await this.timeOffService.findAll(this.ownerId);

    // Generate slots for each day
    const slots: AvailableSlotDto[] = [];
    const now = new Date();

    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
      const daySlots = this.generateSlotsForDay(
        currentDate,
        owner,
        eventType.durationMinutes,
        bookings,
        timeOffs,
        now,
      );
      slots.push(...daySlots);

      // Move to next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return slots;
  }

  private parseDate(dateStr: string): Date {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${dateStr}`);
    }
    return date;
  }

  private validateDateRange(startDate: Date, endDate: Date): void {
    // Set both dates to start of day for comparison
    const startOfDay = new Date(startDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(0, 0, 0, 0);

    // Check startDate is not in the past
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (startOfDay < today) {
      throw new BadRequestException('Start date must be today or in the future');
    }

    // Check endDate is not before startDate
    if (endOfDay < startOfDay) {
      throw new BadRequestException('End date must be after or equal to start date');
    }
  }

  private validateBookingMonthsAhead(
    startDate: Date,
    endDate: Date,
    bookingMonthsAhead: number,
  ): void {
    // Calculate max allowed date: startDate + bookingMonthsAhead months
    const maxAllowedDate = new Date(startDate);
    maxAllowedDate.setUTCMonth(maxAllowedDate.getUTCMonth() + bookingMonthsAhead);

    // endDate must be less than or equal to maxAllowedDate
    if (endDate > maxAllowedDate) {
      throw new BadRequestException(
        `End date must be less than or equal to ${bookingMonthsAhead} months from start date`,
      );
    }
  }

  private generateSlotsForDay(
    date: Date,
    owner: {
      workingDays: DayOfWeek[];
      workingHoursStart: string;
      workingHoursEnd: string;
    },
    durationMinutes: number,
    bookings: Array<{ startTime: Date; endTime: Date }>,
    timeOffs: Array<{ startDateTime: Date; endDateTime: Date }>,
    now: Date,
  ): AvailableSlotDto[] {
    // Get day of week
    const dayOfWeek = this.getDayOfWeek(date);

    // Check if it's a working day
    if (!owner.workingDays.includes(dayOfWeek)) {
      return [];
    }

    // Calculate day boundaries
    const dayStart = this.combineDateAndTime(date, owner.workingHoursStart);
    const dayEnd = this.combineDateAndTime(date, owner.workingHoursEnd);

    // Get busy intervals for this day (bookings + time-offs)
    const busyIntervals = this.getBusyIntervalsForDay(dayStart, dayEnd, bookings, timeOffs);

    // Generate available slots from gaps
    const slots = this.generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

    // Filter out slots that have already started
    return slots
      .filter((slot) => new Date(slot.startTime) > now)
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUN,
      DayOfWeek.MON,
      DayOfWeek.TUE,
      DayOfWeek.WED,
      DayOfWeek.THU,
      DayOfWeek.FRI,
      DayOfWeek.SAT,
    ];
    return days[date.getUTCDay()];
  }

  private combineDateAndTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setUTCHours(hours, minutes, 0, 0);
    return result;
  }

  private getBusyIntervalsForDay(
    dayStart: Date,
    dayEnd: Date,
    bookings: Array<{ startTime: Date; endTime: Date }>,
    timeOffs: Array<{ startDateTime: Date; endDateTime: Date }>,
  ): TimeInterval[] {
    const busy: TimeInterval[] = [];

    // Add bookings that overlap with this day
    for (const booking of bookings) {
      if (booking.startTime < dayEnd && booking.endTime > dayStart) {
        busy.push({
          start: new Date(Math.max(booking.startTime.getTime(), dayStart.getTime())),
          end: new Date(Math.min(booking.endTime.getTime(), dayEnd.getTime())),
        });
      }
    }

    // Add time-offs that overlap with this day
    for (const to of timeOffs) {
      if (to.startDateTime < dayEnd && to.endDateTime > dayStart) {
        busy.push({
          start: new Date(Math.max(to.startDateTime.getTime(), dayStart.getTime())),
          end: new Date(Math.min(to.endDateTime.getTime(), dayEnd.getTime())),
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

  private generateSlotsFromGaps(
    dayStart: Date,
    dayEnd: Date,
    busyIntervals: TimeInterval[],
    durationMinutes: number,
  ): AvailableSlotDto[] {
    const slots: AvailableSlotDto[] = [];
    const durationMs = durationMinutes * 60 * 1000;

    // Generate slots in the gaps between busy intervals
    let currentTime = new Date(dayStart);

    for (const busy of busyIntervals) {
      // Generate slots in the gap before this busy interval
      while (currentTime.getTime() + durationMs <= busy.start.getTime()) {
        const slotEnd = new Date(currentTime.getTime() + durationMs);
        slots.push({
          startTime: currentTime.toISOString(),
          endTime: slotEnd.toISOString(),
        });
        currentTime = slotEnd;
      }

      // Move past this busy interval
      currentTime = new Date(Math.max(currentTime.getTime(), busy.end.getTime()));
    }

    // Generate slots in the final gap (after last busy interval until dayEnd)
    while (currentTime.getTime() + durationMs <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMs);
      slots.push({
        startTime: currentTime.toISOString(),
        endTime: slotEnd.toISOString(),
      });
      currentTime = slotEnd;
    }

    return slots;
  }
}
