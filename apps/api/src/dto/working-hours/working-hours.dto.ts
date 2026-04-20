import { DayOfWeek } from '../../common/enums/day-of-week.enum';

export class WorkingHoursDto {
  id!: string;
  weekday!: DayOfWeek;
  startTime!: string;
  endTime!: string;
}
