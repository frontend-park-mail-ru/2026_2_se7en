export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;

type Validation_messages =
  'FIELD_REQUIRED' | 'EMAIL_INVALID' | 'PASSWORD_TOO_SHORT' | 'PASSWORD_TOO_LONG';
export const VALIDATION_MESSAGES: Record<Validation_messages, string> = {
  FIELD_REQUIRED: 'Обязательное поле',
  EMAIL_INVALID: 'Введите почту в формате name@example.com',
  PASSWORD_TOO_SHORT: 'Длина пароля должна быть от 8 до 16 символов',
  PASSWORD_TOO_LONG: 'Длина пароля должна быть от 8 до 16 символов',
};

type Validation_characters = '&' | '<' | '>' | '"' | "'";
export const VALIDATION_CHARACTERS: Record<Validation_characters, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
