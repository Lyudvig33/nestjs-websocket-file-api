import { ApiProperty } from '@nestjs/swagger';

export class MetaResponseDto {
  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  hasPrev: boolean;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  pageCount: number;
}
