import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokensResponseDto, RefreshTokenDto, LoginDto } from './dto';
import { IJwtConfig, ITokenPayload } from '@core/models';
import { UsersService } from '@resources/users';
import { ERROR_MESSAGES } from '@core/messages';
import { User } from '@core/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private readonly jwtConfig = this.configService.get<IJwtConfig>('JWT_CONFIG');

  async createAccessToken(tokenPayload: ITokenPayload): Promise<string> {
    return this.jwtService.signAsync(tokenPayload, {
      secret: this.jwtConfig.secret,
      expiresIn: this.jwtConfig.expiresIn,
    });
  }

  async createRefreshToken(tokenPayload: ITokenPayload): Promise<string> {
    return this.jwtService.signAsync(tokenPayload, {
      secret: this.jwtConfig.refreshSecret,
      expiresIn: this.jwtConfig.refreshExpiresIn,
    });
  }

  async createTokensResponse(
    tokenPayload: ITokenPayload,
  ): Promise<TokensResponseDto> {
    await this.usersService.revokeAllUserRefreshTokens(tokenPayload.id);

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(tokenPayload),
      this.createRefreshToken(tokenPayload),
    ]);

    await this.usersService.createRefreshToken(tokenPayload.id, refreshToken);

    return {
      id: tokenPayload.id,
      accessToken,
      refreshToken,
    };
  }

  async verifyRefreshToken(refreshTokenDto: RefreshTokenDto): Promise<User> {
    try {
      const payload: ITokenPayload = this.jwtService.verify(
        refreshTokenDto.refreshToken,
        {
          secret: this.jwtConfig.refreshSecret,
        },
      );

      const storedRefreshToken = await this.usersService.findRefreshToken(
        refreshTokenDto.refreshToken,
      );

      if (!storedRefreshToken) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
      }

      if (storedRefreshToken.isRevoked) {
        throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_REVOKED);
      }

      const user = await this.usersService.findById(payload.id);
      if (!user) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await this.usersService.revokeRefreshToken(refreshTokenDto.refreshToken);

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED);
      }

      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async login(loginDto: LoginDto): Promise<TokensResponseDto> {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    return this.createTokensResponse({
      id: user.id,
    });
  }
}
