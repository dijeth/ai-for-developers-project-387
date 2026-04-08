import { IsDateString, IsString } from 'class-validator';

export class TimeOffDto {
  @IsString()
  id!: string;

  @IsDateString()
  startDateTime!: string;

  @IsDateString()
  endDateTime!: string;
}
