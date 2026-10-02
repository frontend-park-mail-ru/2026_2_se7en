import { ApiError } from '../helpers/ApiError.js';

const BASE_URL = 'http://localhost:3001/api/v1';

export class ServerApi {
  static async _request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return null;
      }

      if (!response.ok) {
        const error_data = await response.json().catch(() => ({}));
        throw new ApiError(
          error_data.code || 'UNKNOWN_ERROR',
          error_data.message || `Ошибка сервера: ${response.status}`,
          response.status,
        );
      }
      return await response.json();
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw new ApiError(
          'NETWORK_ERROR',
          'Не удалось подключиться к серверу. Проверьте интернет.',
        );
      }
      throw error;
    }
  }

  static async register(user_data) {
    return this._request('/auth/register', {
      method: 'POST',
      body: user_data,
    });
  }

  static async login(email, password) {
    return this._request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  static async logout() {
    return this._request('/auth/logout', {
      method: 'POST',
    });
  }

  static async getCurrentUser() {
    return this._request('/auth/me');
  }

  static async getChats({ limit = 20, offset = 0 } = {}) {
    return this._request(`/chats?limit=${limit}&offset=${offset}`);
  }
}
