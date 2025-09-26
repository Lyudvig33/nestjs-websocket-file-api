import { NestFactory, Reflector } from '@nestjs/core';
import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
  VersioningType,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { buildError } from '@core/validation';
import { ResponseInterceptor } from '@core/interceptors';
import { HttpExceptionFilter, TypeOrmExceptionFilter } from '@core/filters';

import { AppModule } from './app.module';
import { SanitizePipe } from '@core/pipes';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    index: false,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const reflector = app.get(Reflector);

  app.useGlobalPipes(new SanitizePipe());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors: Record<string, string> = {};
        validationErrors.forEach((e) => {
          const infos = buildError(e);
          infos.forEach(({ property, value }) => {
            errors[property] = property + '_' + value;
          });
        });

        return new UnprocessableEntityException({
          errors,
          message: 'ValidationError',
        });
      },
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  app.enableShutdownHooks();
  app.enableCors();

  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .addBearerAuth()
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);
  }

  await app.listen(process.env.API_PORT || 9000);
}
bootstrap();
