import { ITokenPayload } from '@core/models';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TokenUser = createParamDecorator(
  (
    data: keyof ITokenPayload,
    ctx: ExecutionContext,
  ): ITokenPayload | string => {
    const request = ctx.switchToHttp().getRequest();
    const user: ITokenPayload = request.user;
    return data ? user[data] : user;
  },
);
