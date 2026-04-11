import { Injectable, NotFoundException } from '@nestjs/common';
import { EventTypeService } from '../../prisma/models/event-type.service';
import { EventTypeDto } from '../../dto/event-type/event-type.dto';

@Injectable()
export class PublicEventTypeApiService {
  constructor(private eventTypeService: EventTypeService) {}

  async listEventTypes(): Promise<EventTypeDto[]> {
    const eventTypes = await this.eventTypeService.findAll();
    return eventTypes.map((et) => this.mapToDto(et));
  }

  async getEventType(id: string): Promise<EventTypeDto> {
    const eventType = await this.eventTypeService.findOne(id);

    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    return this.mapToDto(eventType);
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
