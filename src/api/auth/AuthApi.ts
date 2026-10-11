import {
  REGISTER_URL,
  LOGIN_URL,
  LOGOUT_URL,
  GET_CURRENT_USER_URL,
} from '@/api/auth/auth.constants.js';
import { ServerApi } from '@/api/ServerApi.js';
import { mockLogin } from '@/api/auth/auth.mock.js';
import { USING_MOCK } from '@/api/api.constants.js';
import type { ApiResult } from '@/api/ApiResponse.ts';
import type { LoginData, RegisterData, User } from '@/api/auth/auth.types.js';

/**
 * API авторизации и управления сессией пользователя.
 */
export class AuthApi extends ServerApi {
  /**
   * Регистрация нового пользователя.
   */
  static async register(userData: RegisterData): Promise<ApiResult<unknown>> {
    return this._request(REGISTER_URL, {
      method: 'POST',
      body: userData,
    });
  }

  /**
   * Авторизация пользователя.
   */
  static async login(loginData: LoginData): Promise<ApiResult<User>> {
    if (USING_MOCK.AUTH) {
      return mockLogin(loginData);
    }

    return this._request<User>(LOGIN_URL, {
      method: 'POST',
      body: loginData,
    });
  }

  /**
   * Завершение пользовательской сессии.
   */
  static async logout(): Promise<ApiResult<unknown>> {
    return this._request(LOGOUT_URL, {
      method: 'POST',
    });
  }

  /**
   * Получение текущего авторизованного пользователя.
   */
  static async getCurrentUser(): Promise<ApiResult<User>> {
    return this._request<User>(GET_CURRENT_USER_URL);
  }
}
