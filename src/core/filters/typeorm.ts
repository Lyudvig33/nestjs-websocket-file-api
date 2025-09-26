import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { STATUS_CODES } from 'http';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let statusCode = HttpStatus.BAD_REQUEST;
    let errors: string | object = 'err_something_went_wrong';

    console.error('typeorm exception', exception);

    const driverError: any = (exception as any).driverError;

    // Unique constraint violation (PostgreSQL: 23505)
    if (driverError.code === '23505') {
      statusCode = HttpStatus.CONFLICT;
      const detail = driverError.detail;
      const match = detail?.match(/\(([^)]+)\)=/); // extract column name
      const column = match?.[1] || 'field';
      errors = `err_${column}_entity_unique`;
    }

    // Column not found (PostgreSQL: 42703)
    if (driverError.code === '42703') {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      const columnMatch = driverError.message.match(/column "(.+?)"/i);
      const column = columnMatch?.[1] || 'key';
      errors = { [`${column}`]: `err_column_not_exists` };
    }

    response.status(statusCode).json({
      errors,
      status: STATUS_CODES[statusCode],
    });
  }
}
