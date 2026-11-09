import {
  CONTROL_CHARS_REGEX,
  EMAIL_REGEX,
  EMOJI_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  VALIDATION_MESSAGES,
} from '@/constants/Validation.ts';

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

/**
 * Последовательно применяет валидаторы к значению
 * и возвращает первую найденную ошибку (или null).
 */
export function validateMultiple(
  validators: Array<(value: string) => string | null>,
  value: string,
): string | null {
  for (const validate of validators) {
    const error = validate(value);

    if (error) {
      return error;
    }
  }

  return null;
}

/**
 * Проверяет на запрещённые символы.
 */
export function validateForbiddenChars(value: string): string | null {
  if (EMOJI_REGEX.test(value)) {
    return VALIDATION_MESSAGES.CONTAINS_EMOJI;
  }

  if (CONTROL_CHARS_REGEX.test(value)) {
    return VALIDATION_MESSAGES.CONTAINS_INVALID_CHARS;
  }

  return null;
}
