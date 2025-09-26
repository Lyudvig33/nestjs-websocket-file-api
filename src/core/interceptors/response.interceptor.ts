import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { STATUS_CODES } from 'http';
import { Reflector } from '@nestjs/core';

import { ResponseManager } from '@core/helpers/index';

export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<object> {
    return next.handle().pipe(
      map((res) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        const key =
          this.reflector.get<string>('key', context.getHandler()) ?? 'results';

        const data = res?.[key] ?? res;

        const totalCount: number = res?.count;

        let page: number = null;
        let limit: number = null;
        if (
          request.query?.page &&
          request.query?.limit &&
          Number(request.query?.limit) !== 0 &&
          totalCount
        ) {
          page = parseInt(request.query.page as string);
          limit = parseInt(request.query.limit as string);
        }

        // Get the status code from the response object
        const statusCode = response.statusCode;

        // Add the status code to the response body
        const results = {
          [key]: data,
          status: STATUS_CODES[statusCode],
        };

        if (page && limit) {
          const offset = (page - 1) * limit;

          results['_meta'] = ResponseManager.generateMetaResponse(
            offset,
            limit,
            totalCount,
          );
        }

        return results;
      }),
    );
  }
}
