import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  Put,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@core/guards';
import { ITokenPayload } from '@core/models';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiResponseType, TokenUser } from '@core/decorators';
import { User } from '@core/entities';
import { UpdateProfileDto } from './dto';
import { AppGateway } from '@core/gateways';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly appGateway: AppGateway,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponseType(ApiOkResponse, User)
  @ApiBearerAuth()
  async getProfile(@TokenUser() user: ITokenPayload): Promise<User> {
    const userProfile = await this.usersService.getProfile(user.id);
    return userProfile;
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponseType(ApiOkResponse, User)
  @ApiBearerAuth()
  async updateProfile(
    @TokenUser() user: ITokenPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const updatedUser = await this.usersService.updateProfile(
      user.id,
      updateProfileDto,
    );

    this.appGateway.notifyUserProfileUpdated(user.id, {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    });

    return updatedUser;
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deactivate current user account' })
  @ApiBearerAuth()
  async deactivateAccount(@TokenUser() user: ITokenPayload): Promise<void> {
    await this.usersService.deactivateAccount(user.id);

    this.appGateway.notifyUserAccountDeactivated(user.id);
  }
}
