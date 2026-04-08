import { IsISO8601, IsNotEmpty } from 'class-validator';

export class GetAvailableSlotsDto {
  @IsISO8601()
  @IsNotEmpty()
  startDate!: string;

  @IsISO8601()
  @IsNotEmpty()
  endDate!: string;
}
