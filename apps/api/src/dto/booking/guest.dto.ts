import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class GuestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
