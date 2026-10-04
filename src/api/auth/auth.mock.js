import { ApiSuccess, ApiError } from '../ApiResponse.js';
import { ERROR_CODES, ERROR_MESSAGES } from '../error.constants.js';

export const MOCK_CREDENTIALS = {
  email: '1@1.ru',
  password: '228228228',
};

export const MOCK_USER = {
  id: '1',
  email: '1@1.ru',
  phoneNumber: null,
  profile: { id: '2', nickname: 'nick' },
};

/**
 * Мок-ответ на запрос логина. Используется в AuthApi при USING_MOCK = true.
 * Работает без реального сервера: валидирует email и пароль по MOCK_CREDENTIALS.
 *
 * @param {string} email - Email пользователя.
 * @param {string} password - Пароль пользователя.
 * @returns {Promise<ApiSuccess|ApiError>} Успешный ответ с MOCK_USER или ошибка INVALID_CREDENTIALS.
 */
export async function mockLogin(email, password) {
  await new Promise((r) => setTimeout(r, 300));

  if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
    return new ApiSuccess(MOCK_USER, 200);
  }

  return new ApiError(
    ERROR_CODES.INVALID_CREDENTIALS,
    ERROR_MESSAGES[ERROR_CODES.INVALID_CREDENTIALS],
    401,
    null,
  );
}
