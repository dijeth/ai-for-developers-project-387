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

export class BookingDto {
  @IsString()
  id!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsString()
  @MinLength(1)
  guestName!: string;

  @IsEmail()
  guestEmail!: string;

  @ValidateNested()
  @Type(() => BookingEventTypeDto)
  eventType!: BookingEventTypeDto;
}

export class BookingListResponseDto {
  @ValidateNested({ each: true })
  @Type(() => BookingDto)
  bookings!: BookingDto[];
}
