import { DayOfWeek } from '../../common/enums/day-of-week.enum';

export interface PublicOwnerDto {
  name: string;
  description?: string;
  avatar?: string;
  bookingMonthsAhead?: number;
  workingHours: {
    startTime: string;
    endTime: string;
    workingDays: DayOfWeek[];
  };
}
