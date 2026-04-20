import { Controller, Get, Param } from '@nestjs/common';
import { PublicEventTypeApiService } from '../services/public-event-type-api.service';
import { EventTypeDto } from '../../dto/event-type/event-type.dto';
import { EventTypeListResponseDto } from '../../dto/event-type/event-type-list-response.dto';

@Controller('api')
export class PublicEventTypesController {
  constructor(private publicEventTypeApiService: PublicEventTypeApiService) {}

  @Get('event-types')
  async listEventTypes(): Promise<EventTypeListResponseDto> {
    const eventTypes = await this.publicEventTypeApiService.listEventTypes();
    return { eventTypes };
  }

  @Get('event-types/:id')
  async getEventType(@Param('id') id: string): Promise<EventTypeDto> {
    return this.publicEventTypeApiService.getEventType(id);
  }
}
