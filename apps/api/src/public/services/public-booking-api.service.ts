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
    const startTime = new Date(dto.startTime);
    if (isNaN(startTime.getTime())) {
      throw new UnprocessableEntityException('Invalid start time format');
    }

    // Check start time is in the future
    const now = new Date();
    if (startTime <= now) {
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
    // Get date range for slot query (just the day of the booking)
    const dayStart = new Date(startTime);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    // Get available slots for that day
    const availableSlots = await this.availableSlotsService.getAvailableSlots(
      eventTypeId,
      dayStart.toISOString().split('T')[0],
      dayEnd.toISOString().split('T')[0],
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
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      eventType: {
        id: booking.eventType.id,
        title: booking.eventType.title,
        durationMinutes: booking.eventType.durationMinutes,
      },
    };
  }
}
