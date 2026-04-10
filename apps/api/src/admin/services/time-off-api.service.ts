import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { TimeOffService } from '../../prisma/models/time-off.service';
import { BookingService } from '../../prisma/models/booking.service';
import {
  CreateTimeOffDto,
  UpdateTimeOffDto,
} from '../../dto/owner/time-off-request.dto';
import { TimeOffDto } from '../../dto/owner/time-off.dto';
import { fromISO, isUTCAfter, isUTCBefore, utcNow } from '@calendar/date-utils';

@Injectable()
export class TimeOffApiService {
  constructor(
    private timeOffService: TimeOffService,
    private bookingService: BookingService,
  ) {}

  async listTimeOffs(ownerId: string): Promise<TimeOffDto[]> {
    const timeOffs = await this.timeOffService.findAll(ownerId);
    return timeOffs.map((t) => this.mapToDto(t));
  }

  async createTimeOff(
    ownerId: string,
    dto: CreateTimeOffDto,
  ): Promise<TimeOffDto> {
    const startDate = fromISO(dto.startDateTime);
    const endDate = fromISO(dto.endDateTime);

    // Validate: future dates only
    this.validateFutureDates(startDate, endDate);

    // Validate: no bookings in range
    const noBookings = await this.bookingService.checkNoBookingsInRange(
      startDate,
      endDate,
    );
    if (!noBookings) {
      throw new ConflictException(
        'Cannot create time-off: existing bookings in the specified date range',
      );
    }

    const timeOff = await this.timeOffService.create(ownerId, dto);
    return this.mapToDto(timeOff);
  }

  async updateTimeOff(
    ownerId: string,
    id: string,
    dto: UpdateTimeOffDto,
  ): Promise<TimeOffDto> {
    const existing = await this.timeOffService.findOne(id, ownerId);
    if (!existing) {
      throw new NotFoundException('Time-off not found');
    }

    const startDate = dto.startDateTime
      ? fromISO(dto.startDateTime)
      : existing.startDateTime;
    const endDate = dto.endDateTime
      ? fromISO(dto.endDateTime)
      : existing.endDateTime;

    // Validate: future dates only
    this.validateFutureDates(startDate, endDate);

    // Validate: no bookings in range
    const noBookings = await this.bookingService.checkNoBookingsInRange(
      startDate,
      endDate,
    );
    if (!noBookings) {
      throw new ConflictException(
        'Cannot update time-off: existing bookings in the specified date range',
      );
    }

    const updated = await this.timeOffService.update(id, ownerId, dto);
    return this.mapToDto(updated);
  }

  async deleteTimeOff(ownerId: string, id: string): Promise<void> {
    const existing = await this.timeOffService.findOne(id, ownerId);
    if (!existing) {
      throw new NotFoundException('Time-off not found');
    }

    // Validate: future dates only (can't delete past time-offs)
    if (isUTCBefore(existing.endDateTime, utcNow())) {
      throw new ForbiddenException(
        'Cannot delete time-off that has already ended',
      );
    }

    // Validate: no bookings in range
    const noBookings = await this.bookingService.checkNoBookingsInRange(
      existing.startDateTime,
      existing.endDateTime,
    );
    if (!noBookings) {
      throw new ConflictException(
        'Cannot delete time-off: existing bookings in the specified date range',
      );
    }

    await this.timeOffService.delete(id, ownerId);
  }

  private validateFutureDates(startDate: Date, endDate: Date): void {
    const now = utcNow();

    if (isUTCBefore(startDate, now) || startDate.getTime() === now.getTime()) {
      throw new ForbiddenException('Start date must be in the future');
    }

    if (isUTCBefore(endDate, now) || endDate.getTime() === now.getTime()) {
      throw new ForbiddenException('End date must be in the future');
    }

    if (isUTCBefore(endDate, startDate) || endDate.getTime() === startDate.getTime()) {
      throw new BadRequestException('End date must be after start date');
    }
  }

  private mapToDto(timeOff: {
    id: string;
    startDateTime: Date;
    endDateTime: Date;
  }): TimeOffDto {
    return {
      id: timeOff.id,
      startDateTime: timeOff.startDateTime.toISOString(),
      endDateTime: timeOff.endDateTime.toISOString(),
    };
  }
}
