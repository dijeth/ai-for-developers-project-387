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

export class OwnerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

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

  @IsString()
  timezone!: string;
}
