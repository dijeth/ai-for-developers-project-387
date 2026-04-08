import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class EventTypeDto {
  @IsString()
  id!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;
}
