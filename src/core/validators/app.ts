import * as Joi from 'joi';

export const APP_VALIDATIONS = Joi.object({
  NODE_ENV: Joi.string()
    .valid('local', 'dev', 'stage', 'prod')
    .default('local'),
  API_PORT: Joi.number().default(5000),
  ENABLE_SWAGGER: Joi.string().default('true'),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().default('root'),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SYNC: Joi.boolean().default(false),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
});
