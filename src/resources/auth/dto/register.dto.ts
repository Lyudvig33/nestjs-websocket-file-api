import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { VALIDATION_PATTERNS } from '@core/constants';

export class RegisterDto {
  @ApiProperty({ description: 'User full name' })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'test@gmail.com',
  })
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password1!' })
  @MaxLength(50)
  @Matches(VALIDATION_PATTERNS.PASSWORD)
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password: string;
}
