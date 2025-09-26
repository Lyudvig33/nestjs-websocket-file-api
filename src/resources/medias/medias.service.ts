import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { isEmpty } from 'lodash';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { File } from '@core/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { SaveFileResponse } from '@core/models/save-file-response';
import { PaginationQueryDto } from '@core/dtos';
import { ERROR_MESSAGES } from '@core/messages';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediasService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  private getExtension(file: Express.Multer.File): string {
    return file.originalname.split('.').pop().toLowerCase();
  }

  formatPath(basePath: string, id: string, extension: string): string {
    return path.join(basePath, `${id}.${extension}`);
  }

  async saveFile(
    file: Express.Multer.File,
    basePath: string,
  ): Promise<SaveFileResponse> {
    const extension = this.getExtension(file);
    const id = uuid();

    const uploadDir = path.resolve(process.cwd(), basePath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${id}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const urlPath = `/${basePath}/${fileName}`;

    return { filePath: urlPath, key: fileName };
  }

  public async create(data: Partial<File>): Promise<File> {
    const file = this.fileRepository.create(data);
    return this.fileRepository.save(file);
  }

  async checkFilesExistence(
    fileIds: string[],
    userId?: string,
    endsWith?: string,
  ): Promise<boolean> {
    if (isEmpty(fileIds)) return true;

    const files = await this.fileRepository.find({
      where: {
        id: In(fileIds),
        user: userId ? { id: userId } : undefined,
      },
    });

    if (files.length !== new Set(fileIds).size) {
      return false;
    }

    if (endsWith) {
      return files.every((file) => file.url.endsWith(endsWith));
    }

    return true;
  }

  async getFileById(fileId: string): Promise<File> {
    return this.fileRepository.findOne({ where: { id: fileId } });
  }

  async getFile(where: FindOptionsWhere<File>): Promise<File> {
    return this.fileRepository.findOne({ where });
  }

  async deleteById(fileId: string): Promise<void> {
    const file = await this.getFileById(fileId);
    if (file) {
      await this.fileRepository.remove(file);

      const localPath = path.resolve(
        process.cwd(),
        file.url.replace(/^\//, ''),
      );
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
      }
    }
  }

  async getUserFiles(userId: string, paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [files, total] = await this.fileRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: files,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserFileById(fileId: string, userId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
        user: { id: userId },
      },
    });

    if (!file) {
      throw new NotFoundException(ERROR_MESSAGES.FILE_NOT_FOUND);
    }

    return file;
  }

  async deleteUserFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
        user: { id: userId },
      },
    });

    if (!file) {
      throw new NotFoundException(ERROR_MESSAGES.FILE_NOT_FOUND);
    }

    await this.fileRepository.remove(file);

    const localPath = path.resolve(process.cwd(), file.url.replace(/^\//, ''));
    if (fs.existsSync(localPath)) {
      await fs.promises.unlink(localPath);
    }
  }
}
