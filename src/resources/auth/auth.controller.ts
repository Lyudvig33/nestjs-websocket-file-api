import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import {
  AccessTokenDto,
  RegisterDto,
  TokensResponseDto,
  RefreshTokenDto,
  LoginDto,
} from './dto';
import { ApiResponseType } from '@core/decorators';
import { UsersService } from '@resources/users';
import { Transactional } from 'typeorm-transactional';
import { ERROR_MESSAGES } from '@core/messages';
import { AppGateway } from '@core/gateways';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly appGateway: AppGateway,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponseType(ApiCreatedResponse, AccessTokenDto)
  @Transactional()
  async register(@Body() registerDto: RegisterDto): Promise<AccessTokenDto> {
    let user = await this.usersService.findByEmail(registerDto.email);
    if (user) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH_USER_ALREADY_EXISTS);
    } else {
      user = await this.usersService.create(registerDto);
    }

    const tokensResponse = await this.authService.createTokensResponse({
      id: user.id,
    });

    this.appGateway.notifyUserRegistered(user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return {
      id: user.id,
      accessToken: tokensResponse.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponseType(ApiOkResponse, TokensResponseDto)
  @Transactional()
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokensResponseDto> {
    const user = await this.authService.verifyRefreshToken(refreshTokenDto);

    return this.authService.createTokensResponse({
      id: user.id,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponseType(ApiOkResponse, TokensResponseDto)
  @Transactional()
  async login(@Body() loginDto: LoginDto): Promise<TokensResponseDto> {
    const result = await this.authService.login(loginDto);

    this.appGateway.notifyUserLoggedIn(result.id, {
      id: result.id,
      timestamp: new Date().toISOString(),
    });

    return result;
  }
}
