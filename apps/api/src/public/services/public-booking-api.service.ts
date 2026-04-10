import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BookingService } from '../../prisma/models/booking.service';
import { EventTypeService } from '../../prisma/models/event-type.service';
import { OwnerService } from '../../prisma/models/owner.service';
import { CreateBookingDto } from '../../dto/booking/create-booking.dto';
import { BookingDto } from '../../dto/booking/booking.dto';
import { AvailableSlotsService } from './available-slots.service';
import { addUTCDays, fromISO, isUTCBefore, startOfUTCDay, utcNow } from '@calendar/date-utils';

@Injectable()
export class PublicBookingApiService {
  private readonly ownerId = 'owner';

  constructor(
    private bookingService: BookingService,
    private eventTypeService: EventTypeService,
    private ownerService: OwnerService,
    private availableSlotsService: AvailableSlotsService,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<BookingDto> {
    // Validate event type exists
    const eventType = await this.eventTypeService.findOne(dto.eventTypeId);
    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    // Parse start time
    const startTime = fromISO(dto.startTime);
    if (isNaN(startTime.getTime())) {
      throw new UnprocessableEntityException('Invalid start time format');
    }

    // Check start time is in the future
    const now = utcNow();
    if (isUTCBefore(startTime, now) || startTime.getTime() === now.getTime()) {
      throw new UnprocessableEntityException('Start time must be in the future');
    }

    // Calculate end time
    const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60 * 1000);

    // Validate slot is available
    await this.validateSlotAvailable(dto.eventTypeId, startTime, endTime);

    // Create booking
    const booking = await this.bookingService.create({
      eventTypeId: dto.eventTypeId,
      startTime,
      endTime,
      guestName: dto.guest.name,
      guestEmail: dto.guest.email,
    });

    return this.mapToDto(booking);
  }

  private async validateSlotAvailable(
    eventTypeId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    // Get the day of the booking for slot query
    const dayStart = startOfUTCDay(startTime);
    // End of day is start of next day (exclusive)
    const dayEnd = addUTCDays(dayStart, 1);

    // Get available slots for that day (pass as UTC datetime range)
    const availableSlots = await this.availableSlotsService.getAvailableSlots(
      eventTypeId,
      dayStart.toISOString(),
      dayEnd.toISOString(),
    );

    // Check if requested slot is in available slots
    const requestedStartStr = startTime.toISOString();
    const requestedEndStr = endTime.toISOString();

    const isAvailable = availableSlots.some(
      (slot) => slot.startTime === requestedStartStr && slot.endTime === requestedEndStr,
    );

    if (!isAvailable) {
      throw new ConflictException('Time slot is not available');
    }
  }

  private mapToDto(booking: {
    id: string;
    eventTypeId: string;
    startTime: Date;
    endTime: Date;
    guestName: string;
    guestEmail: string;
    eventType: {
      id: string;
      title: string;
      durationMinutes: number;
    };
  }): BookingDto {
    return {
      id: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      guest: {
        name: booking.guestName,
        email: booking.guestEmail,
      },
      eventType: {
        id: booking.eventType.id,
        title: booking.eventType.title,
        durationMinutes: booking.eventType.durationMinutes,
      },
    };
  }
}
