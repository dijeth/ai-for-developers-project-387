import { Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { GuestDto } from './guest.dto';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  eventTypeId!: string;

  @IsISO8601()
  @IsNotEmpty()
  startTime!: string;

  @ValidateNested()
  @Type(() => GuestDto)
  guest!: GuestDto;
}
