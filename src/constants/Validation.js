export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;

export const VALIDATION_MESSAGES = {
  FIELD_REQUIRED: 'Обязательное поле',
  EMAIL_INVALID: 'Введите почту в формате name@example.com',
  PASSWORD_TOO_SHORT: 'Пароль минимум 8 символов',
  PASSWORD_TOO_LONG: 'Пароль максимум 16 символов',
};
