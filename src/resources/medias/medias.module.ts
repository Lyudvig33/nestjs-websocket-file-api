import { Module } from '@nestjs/common';
import { MediasService } from './medias.service';
import { MediasController } from './medias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '@core/entities';
import { CoreModule } from '@core/modules';

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([File])],
  controllers: [MediasController],
  providers: [MediasService],
  exports: [MediasService],
})
export class MediasModule {}
