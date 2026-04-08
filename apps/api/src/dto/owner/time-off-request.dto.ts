import { IsDateString, IsOptional } from 'class-validator';

export class CreateTimeOffDto {
  @IsDateString()
  startDateTime!: string;

  @IsDateString()
  endDateTime!: string;
}

export class UpdateTimeOffDto {
  @IsDateString()
  @IsOptional()
  startDateTime?: string;

  @IsDateString()
  @IsOptional()
  endDateTime?: string;
}
