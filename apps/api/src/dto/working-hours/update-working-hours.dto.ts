import { IsOptional } from 'class-validator';
import { IsTimeString } from '../validators/time-string.validator';

export class UpdateWorkingHoursDto {
  @IsTimeString()
  @IsOptional()
  startTime?: string;

  @IsTimeString()
  @IsOptional()
  endTime?: string;
}
