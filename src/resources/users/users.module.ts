import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserRefreshToken } from '@core/entities';
import { CoreModule } from '@core/modules';

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([User, UserRefreshToken])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
