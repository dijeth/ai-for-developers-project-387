import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventTypeDto } from './event-type.dto';

export class EventTypeListResponseDto {
  @ValidateNested({ each: true })
  @Type(() => EventTypeDto)
  eventTypes!: EventTypeDto[];
}
