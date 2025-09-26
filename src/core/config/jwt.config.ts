import { registerAs } from '@nestjs/config';
import { IJwtConfig } from '@core/models';

export default registerAs(
  'JWT_CONFIG',
  (): IJwtConfig => ({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    secondarySecret: process.env.JWT_SECONDARY_SECRET,
    secondaryExpiresIn: process.env.JWT_SECONDARY_EXPIRES_IN,
  }),
);
