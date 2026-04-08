import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;
}

export class UpdateEventTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  title?: string;

  @IsInt()
  @Min(15)
  @Max(480)
  @IsOptional()
  durationMinutes?: number;
}
