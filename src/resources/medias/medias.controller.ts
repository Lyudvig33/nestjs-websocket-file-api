import {
  Controller,
  HttpStatus,
  HttpCode,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ERROR_MESSAGES } from '@core/messages';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateFileDto, CreateFilesDto } from './dto';
import { JwtAuthGuard } from '@core/guards';
import { ApiResponseType, TokenUser } from '@core/decorators';
import { MediasService } from './medias.service';
import { File, User } from '@core/entities';
import { ITokenPayload } from '@core/models';
import { PaginationQueryDto } from '@core/dtos';
import { AppGateway } from '@core/gateways';

@ApiBearerAuth()
@ApiTags('Medias')
@Controller('medias')
export class MediasController {
  constructor(
    private readonly mediasService: MediasService,
    private readonly appGateway: AppGateway,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    type: CreateFileDto,
  })
  @ApiOperation({
    summary: 'This API aimes one file upload',
  })
  @UseGuards(JwtAuthGuard)
  @ApiResponseType(ApiCreatedResponse, File)
  async createOne(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 20 * 1024 * 1024,
          message: ERROR_MESSAGES.FILE_SIZE_EXCEEDED.message,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
    @TokenUser() user: ITokenPayload,
  ): Promise<File> {
    const basePath = 'files';
    const { filePath, key } = await this.mediasService.saveFile(file, basePath);

    const fileData = await this.mediasService.create({
      url: filePath,
      size: file.size,
      name: file.originalname,
      key,
      user: {
        id: user.id,
      } as User,
    });

    this.appGateway.notifyFileUploaded(user.id, fileData);

    return fileData;
  }

  @Post('bulk')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBody({
    type: CreateFilesDto,
  })
  @ApiOperation({
    summary: 'This API aimes multiple files upload',
  })
  @UseGuards(JwtAuthGuard)
  @ApiResponseType(ApiCreatedResponse, File, {
    isArray: true,
    hasMeta: false,
  })
  async createBulk(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 20 * 1024 * 1024,
          message: ERROR_MESSAGES.FILE_SIZE_EXCEEDED.message,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    files: Array<Express.Multer.File>,
    @TokenUser() user: ITokenPayload,
  ): Promise<File[]> {
    const results: File[] = [];

    for (const file of files) {
      const fileData = await this.createOne(file, user);
      results.push(fileData);
    }

    return results;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user files with pagination' })
  @ApiResponseType(ApiOkResponse, File, {
    isArray: true,
    hasMeta: true,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserFiles(
    @TokenUser() user: ITokenPayload,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.mediasService.getUserFiles(user.id, paginationQuery);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponseType(ApiOkResponse, File)
  async getFileById(
    @Param('id') fileId: string,
    @TokenUser() user: ITokenPayload,
  ): Promise<File> {
    return this.mediasService.getUserFileById(fileId, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiParam({ name: 'id', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(
    @Param('id') fileId: string,
    @TokenUser() user: ITokenPayload,
  ): Promise<void> {
    await this.mediasService.deleteUserFile(fileId, user.id);

    this.appGateway.notifyFileDeleted(user.id, fileId);
  }
}
