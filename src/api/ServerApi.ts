import { BASE_URL } from '@/api/api.constants.ts';
import { STATUSES } from '@/constants/Statuses';
import { eventBus } from '@/helpers/EventBus';
import { ApiError, type ApiResult, ApiSuccess, type ErrorData } from '@/api/ApiResponse.ts';
import { CSRF_HEADER, CSRF_URL, SAFE_METHODS } from '@/api/csrf.constants.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@/api/error.constants.ts';
import { LOGIN_URL, REGISTER_URL } from '@/api/auth/auth.constants.ts';

interface CSRFTokenResponse {
  csrf_token: string;
}

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers' | 'credentials'> {
  body?: unknown;
  headers?: HeadersInit;
  contentType?: string;
  skipAuthRedirect?: boolean;
  skipCsrf?: boolean;
}

/**
 * Базовый класс для выполнения HTTP-запросов к серверу.
 */
export class ServerApi {
  private static csrfToken: string | null = null;
  private static csrfTokenExpiresAt = 0;
  private static csrfTokenRequest: Promise<string | null> | null = null;
  private static csrfGeneration = 0;

  static clearCsrfToken(): void {
    this.csrfGeneration += 1;
    this.csrfToken = null;
    this.csrfTokenExpiresAt = 0;
    this.csrfTokenRequest = null;
  }

  private static async getCsrfToken(): Promise<string | null> {
    if (this.csrfToken && Date.now() < this.csrfTokenExpiresAt) return this.csrfToken;
    if (this.csrfTokenRequest) return this.csrfTokenRequest;

    const generation = this.csrfGeneration;
    const request = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/csrf`, { credentials: 'include' });
        if (!response.ok) return null;
        const data: unknown = await response.json();
        if (
          !data ||
          typeof data !== 'object' ||
          !('csrf_token' in data) ||
          typeof data.csrf_token !== 'string'
        ) {
          return null;
        }
        if (generation !== this.csrfGeneration) return null;
        this.csrfToken = data.csrf_token;
        // Токен backend действует 24 часа; обновляем его с запасом.
        this.csrfTokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000;
        return this.csrfToken;
      } catch {
        return null;
      }
    })();
    this.csrfTokenRequest = request;

    try {
      return await request;
    } finally {
      if (this.csrfTokenRequest === request) this.csrfTokenRequest = null;
    }
  }

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

    const { body, skipAuthRedirect, skipCsrf, ...restOptions } = options;

    const method = (options.method ?? 'GET').toUpperCase();
    if (!skipCsrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const token = await this.getCsrfToken();
      if (token) headers.set('X-CSRF-Token', token);
    }

    const config: RequestInit = {
      ...restOptions,
      headers,
      credentials: 'include',
    };

    if (options.body !== undefined) {
      config.body = isFormData ? <FormData>options.body : JSON.stringify(options.body);
    }

    try {
      const method = (options.method ?? 'GET').toUpperCase();
      const isPublicAuthRequest =
        method === 'POST' && (endpoint === LOGIN_URL || endpoint === REGISTER_URL);
      if (!SAFE_METHODS.includes(method) && !isPublicAuthRequest) {
        const csrf = await ServerApi.getCSRFToken();
        if (csrf.success === false) return csrf;
        if (typeof csrf.data?.csrf_token !== 'string' || !csrf.data.csrf_token) {
          return new ApiError(
            ERROR_CODES.UNKNOWN_ERROR,
            ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
            csrf.status,
          );
        }
        headers.set(CSRF_HEADER, csrf.data.csrf_token);
      }

      const response = await fetch(url, config);

      let responseData: unknown = null;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json') && response.status !== STATUSES.NO_CONTENT) {
        responseData = await response.json().catch(() => null);
      }

      if (response.ok) {
        return new ApiSuccess<T>(responseData as T, response.status);
      }

      if (response.status === 403) this.clearCsrfToken();

      const errorData: ErrorData =
        responseData && typeof responseData === 'object' ? (responseData as ErrorData) : {};

      if (response.status === STATUSES.UNAUTHORIZED) this.clearCsrfToken();
      if (response.status === STATUSES.UNAUTHORIZED && !skipAuthRedirect)
        eventBus.emit('auth:unauthorized');

      return new ApiError(
        errorData.code ?? ERROR_CODES.UNKNOWN_ERROR,
        errorData.message ?? ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
        response.status,
        errorData.details,
      );
    } catch {
      return new ApiError(ERROR_CODES.NETWORK_ERROR, ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR], 0);
    }
  }
}
