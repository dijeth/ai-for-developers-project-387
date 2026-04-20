import { IsEnum } from 'class-validator';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { IsTimeString } from '../validators/time-string.validator';

export class CreateWorkingHoursDto {
  @IsEnum(DayOfWeek)
  weekday!: DayOfWeek;

  @IsTimeString()
  startTime!: string;

  @IsTimeString()
  endTime!: string;
}
