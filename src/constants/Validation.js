export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email обязателен',
  EMAIL_INVALID: 'Email некорректен',
  PASSWORD_REQUIRED: 'Пароль обязателен',
  PASSWORD_TOO_SHORT: 'Пароль минимум 8 символов',
  PASSWORD_TOO_LONG: 'Пароль максимум 16 символов',
};
