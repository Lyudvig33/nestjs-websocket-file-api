import { NodeEnv } from '@core/enums';
import { IAppConfig } from '@core/models';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'APP_CONFIG',
  (): IAppConfig => ({
    nodeEnv: process.env.NODE_ENV as NodeEnv,
    port: parseInt(process.env.API_PORT, 10),
  }),
);
