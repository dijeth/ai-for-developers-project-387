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
  @MaxLength(200)
  title!: string;

  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;

  @IsString()
  @MaxLength(300)
  @IsOptional()
  description?: string;
}

export class UpdateEventTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsInt()
  @Min(15)
  @Max(480)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @MaxLength(300)
  @IsOptional()
  description?: string;
}
