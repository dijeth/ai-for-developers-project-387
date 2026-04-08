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
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { IsTimeString } from '../validators/time-string.validator';
import { IsDayOfWeekArray } from '../validators/day-of-week-array.validator';

export class WorkingHoursDto {
  @IsTimeString()
  startTime!: string;

  @IsTimeString()
  endTime!: string;

  @IsDayOfWeekArray()
  workingDays!: DayOfWeek[];
}

export class OwnerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

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
  @Type(() => WorkingHoursDto)
  workingHours!: WorkingHoursDto;
}
