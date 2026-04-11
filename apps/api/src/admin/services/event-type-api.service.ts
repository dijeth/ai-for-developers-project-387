import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventTypeService } from '../../prisma/models/event-type.service';
import { BookingService } from '../../prisma/models/booking.service';
import {
  CreateEventTypeDto,
  UpdateEventTypeDto,
} from '../../dto/event-type/event-type-request.dto';
import { EventTypeDto } from '../../dto/event-type/event-type.dto';

@Injectable()
export class EventTypeApiService {
  constructor(
    private eventTypeService: EventTypeService,
    private bookingService: BookingService,
  ) {}

  async listEventTypes(): Promise<EventTypeDto[]> {
    const eventTypes = await this.eventTypeService.findAll();
    return eventTypes.map((et) => this.mapToDto(et));
  }

  async createEventType(dto: CreateEventTypeDto): Promise<EventTypeDto> {
    const eventType = await this.eventTypeService.create(dto);
    return this.mapToDto(eventType);
  }

  async updateEventType(
    id: string,
    dto: UpdateEventTypeDto,
  ): Promise<EventTypeDto> {
    const existing = await this.eventTypeService.findOne(id);
    if (!existing) {
      throw new NotFoundException('Event type not found');
    }

    const updated = await this.eventTypeService.update(id, dto);
    return this.mapToDto(updated);
  }

  async deleteEventType(id: string): Promise<void> {
    const existing = await this.eventTypeService.findOne(id);
    if (!existing) {
      throw new NotFoundException('Event type not found');
    }

    // Check if there are bookings for this event type
    const hasBookings = await this.bookingService.hasBookingsForEventType(id);
    if (hasBookings) {
      throw new ForbiddenException(
        'Cannot delete event type: existing bookings use this event type',
      );
    }

    await this.eventTypeService.delete(id);
  }

  private mapToDto(eventType: {
    id: string;
    title: string;
    durationMinutes: number;
    description?: string | null;
  }): EventTypeDto {
    return {
      id: eventType.id,
      title: eventType.title,
      durationMinutes: eventType.durationMinutes,
      description: eventType.description ?? undefined,
    };
  }
}
