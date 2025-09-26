import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export const DEFAULT_LIMIT = 20;
export const DEFAULT_PAGE = 1;

export class PaginationQueryDto {
  @ApiProperty({
    default: DEFAULT_LIMIT,
    required: false,
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value as string))
  @IsOptional()
  limit: number = DEFAULT_LIMIT;

  @ApiProperty({
    default: DEFAULT_PAGE,
    required: false,
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value as string))
  @IsOptional()
  page: number = DEFAULT_PAGE;

  @ApiHideProperty()
  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
