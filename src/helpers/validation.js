import {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  VALIDATION_MESSAGES,
} from '../constants/Validation.js';

export function validateEmail(email) {
  if (!email) return VALIDATION_MESSAGES.EMAIL_REQUIRED;
  if (!EMAIL_REGEX.test(email)) return VALIDATION_MESSAGES.EMAIL_INVALID;
  return null;
}

export function validatePassword(password) {
  if (!password) return VALIDATION_MESSAGES.PASSWORD_REQUIRED;
  if (password.length < PASSWORD_MIN_LENGTH) return VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
  if (password.length > PASSWORD_MAX_LENGTH) return VALIDATION_MESSAGES.PASSWORD_TOO_LONG;
  return null;
}
