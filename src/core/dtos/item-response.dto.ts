import { ApiProperty } from '@nestjs/swagger';

export class ItemResponseDto {
  @ApiProperty()
  status: string;
}
