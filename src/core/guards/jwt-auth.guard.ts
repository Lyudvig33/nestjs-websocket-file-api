import { ERROR_MESSAGES } from '@core/messages';
import { ITokenPayload } from '@core/models';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(public readonly jwtService: JwtService) {}

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
      const user: ITokenPayload = this.jwtService.verify(accessToken);
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
