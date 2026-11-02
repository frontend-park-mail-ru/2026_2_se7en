export interface ErrorDetail {
  field: string;
  reason: string;
}

export class ApiSuccess<T = unknown> {
  readonly success = true;

  constructor(
    readonly data: T,
    readonly status: number,
  ) {}
}

export class ApiError {
  readonly success = false;

  constructor(
    readonly code: string,
    readonly message: string,
    readonly status: number,
    readonly details?: ErrorDetail[],
  ) {}
}

export type ApiResult<T = unknown> = ApiSuccess<T> | ApiError;

export interface ErrorData {
  code?: string;
  message?: string;
  details?: ErrorDetail[];
}
