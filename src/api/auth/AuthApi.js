import { REGISTER_URL, LOGIN_URL, LOGOUT_URL, GET_CURRENT_USER_URL } from './auth.constants';
import { ServerApi } from '../ServerApi';

/**
 * Класс для взаимодействия с API аутентификации и управления сессией пользователя.
 */
export class AuthApi {
  /**
   * @param {Object} user_data
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async register(user_data) {
    return ServerApi._request(REGISTER_URL, {
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
    return ServerApi._request(LOGIN_URL, {
      method: 'POST',
      body: { email, password },
    });
  }

  /**
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async logout() {
    return ServerApi._request(LOGOUT_URL, {
      method: 'POST',
    });
  }

  /**
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async getCurrentUser() {
    return ServerApi._request(GET_CURRENT_USER_URL);
  }
}
