import {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  VALIDATION_MESSAGES,
} from '../constants/Validation.js';

/**
 * Проверяет email на непустоту и соответствие регулярному выражению.
 *
 * @param {string} email - Email для проверки.
 * @returns {string|null} Текст ошибки или null, если поле валидно.
 */
export function validateEmail(email) {
  if (!email) return VALIDATION_MESSAGES.FIELD_REQUIRED;
  if (!EMAIL_REGEX.test(email)) return VALIDATION_MESSAGES.EMAIL_INVALID;
  return null;
}

/**
 * Проверяет пароль на непустоту и длину в допустимых границах.
 *
 * @param {string} password - Пароль для проверки.
 * @returns {string|null} Текст ошибки или null, если поле валидно.
 */
export function validatePassword(password) {
  if (!password) return VALIDATION_MESSAGES.FIELD_REQUIRED;
  if (password.length < PASSWORD_MIN_LENGTH) return VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
  if (password.length > PASSWORD_MAX_LENGTH) return VALIDATION_MESSAGES.PASSWORD_TOO_LONG;
  return null;
}
