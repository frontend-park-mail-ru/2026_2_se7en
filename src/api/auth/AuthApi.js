import { REGISTER_URL, LOGIN_URL, LOGOUT_URL, GET_CURRENT_USER_URL } from './auth.constants.js';
import { ServerApi } from '../ServerApi.js';
import { mockLogin } from './auth.mock.js';
import { USING_MOCK } from '../api.constants.js';

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
    if (USING_MOCK) return mockLogin(email, password);

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
