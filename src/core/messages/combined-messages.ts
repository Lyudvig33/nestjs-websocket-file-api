import { AUTH_MESSAGES } from './auth.messages';
import { FILES_ERROR_MESSAGES } from './file.messages';

export const ERROR_MESSAGES = {
  ...AUTH_MESSAGES,
  ...FILES_ERROR_MESSAGES,
};
