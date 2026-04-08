import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventTypeApiService } from '../services/event-type-api.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from '../../dto/event-type/event-type-request.dto';
import { EventTypeDto } from '../../dto/event-type/event-type.dto';
import { EventTypeListResponseDto } from '../../dto/event-type/event-type-list-response.dto';

@Controller('api/admin')
export class AdminEventTypesController {
  constructor(private eventTypeApiService: EventTypeApiService) {}

  @Get('event-types')
  async listEventTypes(): Promise<EventTypeListResponseDto> {
    const eventTypes = await this.eventTypeApiService.listEventTypes();
    return { eventTypes };
  }

  @Post('event-types')
  @HttpCode(HttpStatus.CREATED)
  async createEventType(@Body() dto: CreateEventTypeDto): Promise<EventTypeDto> {
    return this.eventTypeApiService.createEventType(dto);
  }

  @Put('event-types/:id')
  async updateEventType(
    @Param('id') id: string,
    @Body() dto: UpdateEventTypeDto,
  ): Promise<EventTypeDto> {
    return this.eventTypeApiService.updateEventType(id, dto);
  }

  @Delete('event-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEventType(@Param('id') id: string): Promise<void> {
    return this.eventTypeApiService.deleteEventType(id);
  }
}
