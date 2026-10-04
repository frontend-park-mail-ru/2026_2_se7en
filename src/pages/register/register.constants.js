export const ELEMENT_IDS = {
  FORM: 'register-form',
  EMAIL: 'email',
  PASSWORD: 'password',
  NICKNAME: 'nickname',
  FIRST_NAME: 'first_name',
  SUBMIT_BUTTON: 'submit-button',
  ERROR_CONTAINER: 'error-container',
  ERROR_MESSAGE: 'error-message',
};

export const VALIDATION_RULES = {
  email: {
    required: true,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 16,
  },
  nickname: {
    required: true,
    minLength: 3,
    maxLength: 16,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  first_name: {
    required: true,
    maxLength: 32,
  },
};

export const ERROR_MESSAGES = {
  required: 'Обязательное поле',
  nickname_length: 'Длина никнейма должна быть от 3 до 16 символов',
  nickname_invalid_format:
    'Можно использовать только латинские буквы, цифры и нижнее подчёркивание',
  nickname_already_exists: 'Такой никнейм уже используется',
  password_length: 'Длина пароля должна быть от 8 до 16 символов',
  email_invalid_format: 'Введите почту в формате name@example.com',
  email_max_length: 'Электронная почта должна содержать не более 255 символов',
  email_already_exists: 'Такая электронная почта уже используется',
  first_name_max_length: 'Имя должно содержать не более 32 символов',
  invalid_format: 'Неверный формат',
  max_length_exceeded: 'Превышена максимальная длина',
};

export const ERROR_STATUSES = {
  STATUS_CREATED: 201,
  STATUS_BAD_REQUEST: 400,
  STATUS_CONFLICT: 409,
};
