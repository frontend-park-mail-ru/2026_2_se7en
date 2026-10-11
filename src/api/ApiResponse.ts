/**
 * Успешный ответ от сервера.
 *
 * T — тип данных, которые находятся в поле data.
 */
export class ApiSuccess<T = unknown> {
  readonly success = true;

  constructor(
    public readonly data: T,
    public readonly status: number,
  ) {}
}

/**
 * Ошибка сервера или сети.
 */
export class ApiError {
  readonly success = false;

  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly status: number,
  ) {}
}

/**
 * Общий тип результата API-запроса.
 */
export type ApiResult<T = unknown> = ApiSuccess<T> | ApiError;
