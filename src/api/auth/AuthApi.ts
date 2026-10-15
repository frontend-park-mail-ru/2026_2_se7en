import {
  REGISTER_URL,
  LOGIN_URL,
  LOGOUT_URL,
  GET_CURRENT_USER_URL,
} from '@/api/auth/auth.constants.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { mockLogin } from '@/api/auth/auth.mock.ts';
import { USING_MOCK } from '@/api/api.constants.ts';
import type { ApiResult } from '@/api/ApiResponse.ts';
import type { LoginData, RegisterData, User } from '@/api/auth/auth.types.ts';

/**
 * API авторизации и управления сессией пользователя.
 */
export class AuthApi extends ServerApi {
  /**
   * Регистрация нового пользователя.
   */
  static async register(userData: RegisterData) {
    return this._request(REGISTER_URL, {
      method: 'POST',
      body: userData,
      skipAuthRedirect: true,
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
      skipAuthRedirect: true,
    });
  }

  /**
   * Завершение пользовательской сессии.
   */
  static async logout() {
    return this._request(LOGOUT_URL, {
      method: 'POST',
      skipAuthRedirect: true,
    });
  }

  /**
   * Получение текущего авторизованного пользователя.
   */
  static async getCurrentUser(): Promise<ApiResult<User>> {
    return this._request<User>(GET_CURRENT_USER_URL);
  }
}
