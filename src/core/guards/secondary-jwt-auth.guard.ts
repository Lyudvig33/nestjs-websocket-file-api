import { ERROR_MESSAGES } from '@core/messages';
import { IJwtConfig, ITokenPayload } from '@core/models';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SecondaryJwtAuthGuard implements CanActivate {
  constructor(
    public readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly jwtConfig = this.configService.get<IJwtConfig>('JWT_CONFIG');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ForbiddenException(ERROR_MESSAGES.TOKEN_NOT_PROVIDED);
    }
    const accessToken: string = authHeader?.replace('Bearer', '')?.trim();

    if (!accessToken) {
      throw new ForbiddenException(ERROR_MESSAGES.TOKEN_NOT_PROVIDED);
    }

    try {
      const user: ITokenPayload = this.jwtService.verify(accessToken, {
        secret: this.jwtConfig.secondarySecret,
      });
      req.user = user;
      return true;
    } catch (e) {
      if (e.status === 403) {
        throw e;
      }
      throw new UnauthorizedException(ERROR_MESSAGES.USER_UNAUTHORIZED);
    }
  }
}
