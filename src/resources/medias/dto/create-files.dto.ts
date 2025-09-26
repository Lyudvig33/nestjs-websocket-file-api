import { ApiProperty } from '@nestjs/swagger';

export class CreateFilesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  files: Express.Multer.File[];
}
