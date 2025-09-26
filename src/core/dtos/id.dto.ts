import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class IdDto {
  @ApiProperty({
    example: '4d691ced-e8ca-4f38-9747-59437b9348a6',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
