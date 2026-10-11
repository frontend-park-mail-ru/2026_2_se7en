import {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  VALIDATION_MESSAGES,
} from '@/constants/Validation.js';

/**
 * Проверяет email на непустоту и соответствие регулярному выражению.
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return VALIDATION_MESSAGES.FIELD_REQUIRED;
  }

  if (!EMAIL_REGEX.test(email)) {
    return VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  return null;
}

/**
 * Проверяет пароль на непустоту и допустимую длину.
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return VALIDATION_MESSAGES.FIELD_REQUIRED;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return VALIDATION_MESSAGES.PASSWORD_TOO_LONG;
  }

  return null;
}
