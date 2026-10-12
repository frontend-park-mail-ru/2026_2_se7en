import { ApiSuccess, ApiError, type ApiResult } from '@/api/ApiResponse.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@/api/error.constants.ts';
import { STATUSES } from '@/constants/Statuses.js';
import type { LoginData, User } from '@/api/auth/auth.types.ts';

export const MOCK_CREDENTIALS: LoginData = {
  email: '1@1.ru',
  password: '228228228',
};

export const MOCK_USER: User = {
  id: '1',
  email: '1@1.ru',
  phoneNumber: null,
  profile: { id: '2', nickname: 'nick' },
};

/**
 * Мок-ответ на запрос логина. Используется в AuthApi при USING_MOCK = true.
 * Работает без реального сервера: валидирует email и пароль по MOCK_CREDENTIALS.
 */
export async function mockLogin(loginData: LoginData): Promise<ApiResult<User>> {
  await new Promise<void>((r) => setTimeout(r, 300));

  if (
    loginData.email === MOCK_CREDENTIALS.email &&
    loginData.password === MOCK_CREDENTIALS.password
  ) {
    return new ApiSuccess<User>(MOCK_USER, STATUSES.OK);
  }

  return new ApiError(
    ERROR_CODES.INVALID_CREDENTIALS,
    ERROR_MESSAGES[ERROR_CODES.INVALID_CREDENTIALS],
    STATUSES.UNAUTHORIZED,
  );
}
