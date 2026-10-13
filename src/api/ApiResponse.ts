/**
 * Успешный ответ от сервера.
 *
 * T — тип данных, которые находятся в поле data.
 */
export class ApiSuccess<T = unknown> {
  readonly success = true;

  constructor(
    readonly data: T,
    readonly status: number,
  ) {}
}

/**
 * Ошибка сервера или сети.
 */
export class ApiError {
  readonly success = false;

  constructor(
    readonly code: string,
    readonly message: string,
    readonly status: number,
  ) {}
}

/**
 * Общий тип результата API-запроса.
 */
export type ApiResult<T = unknown> = ApiSuccess<T> | ApiError;

/**
 * Структура данных ошибки, возвращаемой сервером.
 */
export interface ErrorData {
  code?: string;
  message?: string;
}
