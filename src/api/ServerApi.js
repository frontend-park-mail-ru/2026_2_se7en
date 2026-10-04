import { ApiSuccess, ApiError } from './ApiResponse.js';
import { BASE_URL } from './api.constants.js';
import { ERROR_CODES, ERROR_MESSAGES } from './error.constants.js';

/**
 * Базовый класс для выполнения HTTP-запросов к серверу.
 */
export class ServerApi {
  /**
   * @param {string} endpoint
   * @param {RequestInit} [options]
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async _request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        'Content-Type':
          options.headers?.['Content-Type'] || options.contentType || 'application/json',
      },
      credentials: 'include',
    };

    if (options.body) {
      if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
        config.body = options.body;
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, config);

      let responseData = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json') && response.status !== 204) {
        responseData = await response.json().catch(() => null);
      }

      if (response.ok) {
        return new ApiSuccess(responseData, response.status);
      }

      return new ApiError(
        responseData?.code || ERROR_CODES.UNKNOWN_ERROR,
        responseData?.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
        response.status,
        responseData?.details || null,
      );
    } catch {
      return new ApiError(
        ERROR_CODES.NETWORK_ERROR,
        ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        0,
        null,
      );
    }
  }
}
