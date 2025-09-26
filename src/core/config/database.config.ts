import { IDatabaseConnection } from '@core/models';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'DB_CONFIG',
  (): IDatabaseConnection => ({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    sync: process.env.DATABASE_SYNC === 'true' ? true : false,
  }),
);
