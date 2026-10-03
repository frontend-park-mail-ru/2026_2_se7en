import { REGISTER_URL, LOGIN_URL, LOGOUT_URL, GET_CURRENT_USER_URL } from './auth.constants.js';
import { ServerApi } from '../ServerApi.js';
import { ApiSuccess, ApiError } from '../ApiResponse.js';

const USING_MOCK = true;

/**
 * Класс для взаимодействия с API аутентификации и управления сессией пользователя.
 */
export class AuthApi extends ServerApi {
  /**
   * @param {Object} user_data
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async register(user_data) {
    return this._request(REGISTER_URL, {
      method: 'POST',
      body: user_data,
    });
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async login(email, password) {
    if (USING_MOCK) {
      await new Promise((r) => setTimeout(r, 300));

      if (email === '1@1.ru' && password === '228228228') {
        return new ApiSuccess(
          {
            id: '1',
            email,
            phoneNumber: null,
            profile: { id: '2', nickname: 'nick' },
          },
          200,
        );
      }

      return new ApiError('INVALID_CREDENTIALS', 'Неверный email или пароль', 401, null);
    }

    return this._request(LOGIN_URL, {
      method: 'POST',
      body: { email, password },
    });
  }

  /**
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async logout() {
    return this._request(LOGOUT_URL, {
      method: 'POST',
    });
  }

  /**
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async getCurrentUser() {
    return this._request(GET_CURRENT_USER_URL);
  }
}
