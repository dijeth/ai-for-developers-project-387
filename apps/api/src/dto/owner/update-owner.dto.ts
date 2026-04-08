import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsTimeString } from '../validators/time-string.validator';
import { IsDayOfWeekArray } from '../validators/day-of-week-array.validator';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';

export class WorkingHoursUpdateDto {
  @IsTimeString()
  @IsOptional()
  startTime?: string;

  @IsTimeString()
  @IsOptional()
  endTime?: string;

  @IsDayOfWeekArray()
  @IsOptional()
  workingDays?: DayOfWeek[];
}

export class UpdateOwnerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  bookingMonthsAhead?: number;

  @ValidateNested()
  @Type(() => WorkingHoursUpdateDto)
  @IsOptional()
  workingHours?: WorkingHoursUpdateDto;
}
