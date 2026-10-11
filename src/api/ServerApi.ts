import { ApiSuccess, ApiError, type ApiResult } from '@/api/ApiResponse.ts';
import { BASE_URL } from '@/api/api.constants.js';
import { ERROR_CODES, ERROR_MESSAGES } from '@/api/error.constants.js';

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers' | 'credentials'> {
  body?: unknown;
  headers?: HeadersInit;
  contentType?: string;
}

/**
 * Базовый класс для выполнения HTTP-запросов к серверу.
 */
export class ServerApi {
  /**
   * Выполняет запрос и возвращает успешный результат
   * либо объект ошибки.
   */
  static async _request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResult<T>> {
    const url = `${BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers);

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    if (!headers.has('Content-Type') && !isFormData) {
      headers.set('Content-Type', options.contentType ?? 'application/json');
    }

    const { body, ...restOptions } = options;

    const config: RequestInit = {
      ...restOptions,
      headers,
      credentials: 'include',
    };

    if (options.body !== undefined) {
      if (isFormData) {
        config.body = options.body as FormData;
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, config);

      let responseData: unknown = null;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json') && response.status !== 204) {
        responseData = await response.json().catch(() => null);
      }

      if (response.ok) {
        return new ApiSuccess<T>(responseData as T, response.status);
      }

      const errorData =
        responseData && typeof responseData === 'object'
          ? (responseData as { code?: string; message?: string })
          : {};

      return new ApiError(
        errorData.code ?? ERROR_CODES.UNKNOWN_ERROR,
        errorData.message ?? ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
        response.status,
      );
    } catch {
      return new ApiError(ERROR_CODES.NETWORK_ERROR, ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR], 0);
    }
  }
}
