import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    required: false,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: 'URL to user profile picture', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePictureUrl?: string;
}
