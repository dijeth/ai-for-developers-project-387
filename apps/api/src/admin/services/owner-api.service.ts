import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { OwnerService } from '../../prisma/models/owner.service';
import { WorkingHoursService } from '../../prisma/models/working-hours.service';
import { BookingService } from '../../prisma/models/booking.service';
import { UpdateOwnerDto } from '../../dto/owner/update-owner.dto';
import { OwnerDto } from '../../dto/owner/owner.dto';
import { TimezoneConverterService } from './timezone-converter.service';
import { addUTCMonths, utcNow } from '@calendar/date-utils';

@Injectable()
export class OwnerApiService {
  constructor(
    private ownerService: OwnerService,
    private workingHoursService: WorkingHoursService,
    private bookingService: BookingService,
    private timezoneConverterService: TimezoneConverterService,
  ) {}

  async getOwner(ownerId: string): Promise<OwnerDto> {
    const owner = await this.ownerService.findOne(ownerId);

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    return this.mapToDto(owner);
  }

  async updateOwner(ownerId: string, dto: UpdateOwnerDto): Promise<OwnerDto> {
    const owner = await this.ownerService.findOne(ownerId);

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // If timezone is being changed, recalculate working hours and check for conflicts
    if (dto.timezone !== undefined && dto.timezone !== owner.timezone) {
      await this.handleTimezoneChange(
        ownerId,
        owner.timezone,
        dto.timezone,
        owner.bookingMonthsAhead,
      );
    }

    const updated = await this.ownerService.update(ownerId, dto);
    return this.mapToDto(updated);
  }

  /**
   * Handles timezone change by:
   * 1. Converting working hours to new timezone
   * 2. Clamping times to 00:00-23:59 bounds
   * 3. Checking for booking conflicts in "clipped" intervals
   * 4. Updating working hours if no conflicts
   */
  private async handleTimezoneChange(
    ownerId: string,
    oldTimezone: string,
    newTimezone: string,
    bookingMonthsAhead: number,
  ): Promise<void> {
    // Get current working hours
    const workingHours = await this.workingHoursService.findByOwnerId(ownerId);

    if (workingHours.length === 0) {
      // No working hours to convert
      return;
    }

    // Convert working hours to new timezone
    const conversionResult =
      this.timezoneConverterService.convertWorkingHoursToNewTimezone(
        workingHours,
        oldTimezone,
        newTimezone,
      );

    // If there are clipped intervals, check for booking conflicts
    if (conversionResult.clippedIntervals.length > 0) {
      // Get date range for checking bookings (now to max booking months ahead)
      const now = utcNow();
      const maxDate = addUTCMonths(now, bookingMonthsAhead);

      // Get all bookings in the range
      const bookings = await this.bookingService.findInRange(now, maxDate);

      // Check for conflicts with clipped intervals
      const conflicts =
        this.timezoneConverterService.findConflictingBookings(
          bookings,
          conversionResult.clippedIntervals,
        );

      if (conflicts.length > 0) {
        throw new ConflictException(
          'Cannot change timezone: existing bookings conflict with adjusted working hours',
        );
      }
    }

    // No conflicts - update working hours
    if (conversionResult.adjustedHours.length > 0) {
      await this.workingHoursService.replaceAll(
        ownerId,
        conversionResult.adjustedHours,
      );
    }
  }

  private mapToDto(owner: {
    name: string;
    email: string;
    description: string | null;
    avatar: string | null;
    bookingMonthsAhead: number;
    timezone: string;
  }): OwnerDto {
    return {
      name: owner.name,
      email: owner.email,
      description: owner.description ?? undefined,
      avatar: owner.avatar ?? undefined,
      bookingMonthsAhead: owner.bookingMonthsAhead,
      timezone: owner.timezone,
    };
  }
}

