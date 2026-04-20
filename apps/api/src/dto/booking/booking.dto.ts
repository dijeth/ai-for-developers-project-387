import {
  IsDateString,
  IsEmail,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BookingEventTypeDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  durationMinutes!: number;
}

export class GuestDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;
}

export class BookingDto {
  @IsString()
  id!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @ValidateNested()
  @Type(() => GuestDto)
  guest!: GuestDto;

  @ValidateNested()
  @Type(() => BookingEventTypeDto)
  eventType!: BookingEventTypeDto;
}

export class BookingListResponseDto {
  @ValidateNested({ each: true })
  @Type(() => BookingDto)
  bookings!: BookingDto[];
}
