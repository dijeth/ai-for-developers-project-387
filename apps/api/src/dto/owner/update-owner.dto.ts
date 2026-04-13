import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsTimezone } from '../validators/timezone.validator';

export class UpdateOwnerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  bookingMonthsAhead?: number;

  @IsTimezone()
  @IsOptional()
  timezone?: string;
}
