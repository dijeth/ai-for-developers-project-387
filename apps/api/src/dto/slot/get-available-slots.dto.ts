import { IsISO8601, IsNotEmpty } from 'class-validator';

export class GetAvailableSlotsDto {
  @IsISO8601()
  @IsNotEmpty()
  dateFrom!: string;

  @IsISO8601()
  @IsNotEmpty()
  dateTo!: string;
}
