import { Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { GuestDto } from './guest.dto';

export class CreateBookingDto {
  @IsString({ message: 'Event type ID must be a string' })
  @IsNotEmpty({ message: 'Event type ID is required' })
  eventTypeId!: string;

  @IsISO8601({}, { message: 'Start time must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'Start time is required' })
  startTime!: string;

  @ValidateNested({ message: 'Guest information is invalid' })
  @Type(() => GuestDto)
  guest!: GuestDto;
}
