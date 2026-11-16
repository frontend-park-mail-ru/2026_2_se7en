import type { ApiResult } from '@/api/ApiResponse.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { USING_MOCK } from '@/api/api.constants.ts';
import { mockLogin } from '@/api/auth/auth.mock.ts';
import {
  GET_CURRENT_USER_URL,
  LOGIN_URL,
  LOGOUT_URL,
  REGISTER_URL,
} from '@/api/auth/auth.constants.ts';
import type { LoginData, RegisterData, User } from '@/api/auth/auth.types.ts';

/**
 * API авторизации и управления сессией пользователя.
 */
export class AuthApi extends ServerApi {
  /**
   * Регистрация нового пользователя.
   */
  static async register(userData: RegisterData) {
    this.clearCsrfToken();
    const result = await this._request<User>(REGISTER_URL, {
      method: 'POST',
      body: userData,
      skipAuthRedirect: true,
      skipCsrf: true,
    });
    if (result.success) this.clearCsrfToken();
    return result;
  }

  /**
   * Авторизация пользователя.
   */
  static async login(loginData: LoginData): Promise<ApiResult<User>> {
    this.clearCsrfToken();
    if (USING_MOCK.AUTH) {
      return mockLogin(loginData);
    }

    const result = await this._request<User>(LOGIN_URL, {
      method: 'POST',
      body: loginData,
      skipAuthRedirect: true,
      skipCsrf: true,
    });
    if (result.success) this.clearCsrfToken();
    return result;
  }

  /**
   * Завершение пользовательской сессии.
   */
  static async logout() {
    const result = await this._request(LOGOUT_URL, {
      method: 'POST',
      skipAuthRedirect: true,
    });
    this.clearCsrfToken();
    return result;
  }

  /**
   * Получение текущего авторизованного пользователя.
   */
  static async getCurrentUser(): Promise<ApiResult<User>> {
    return this._request<User>(GET_CURRENT_USER_URL, {
      skipAuthRedirect: true,
    });
  }
}
