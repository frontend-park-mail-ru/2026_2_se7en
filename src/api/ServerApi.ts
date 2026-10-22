import { ApiError, type ApiResult, ApiSuccess, type ErrorData } from '@/api/ApiResponse.ts';
import { BASE_URL } from '@/api/api.constants.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@/api/error.constants.ts';
import { eventBus } from '@/helpers/EventBus';
import { STATUSES } from '@/constants/Statuses';

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers' | 'credentials'> {
  body?: unknown;
  headers?: HeadersInit;
  contentType?: string;
  skipAuthRedirect?: boolean;
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
      config.body = isFormData ? <FormData>options.body : JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      let responseData: unknown = null;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json') && response.status !== STATUSES.NO_CONTENT) {
        responseData = await response.json().catch(() => null);
      }

      if (response.ok) {
        return new ApiSuccess<T>(responseData as T, response.status);
      }

      const errorData: ErrorData =
        responseData && typeof responseData === 'object' ? (responseData as ErrorData) : {};

      if (response.status === STATUSES.UNAUTHORIZED && !options.skipAuthRedirect)
        eventBus.emit('auth:unauthorized');

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
