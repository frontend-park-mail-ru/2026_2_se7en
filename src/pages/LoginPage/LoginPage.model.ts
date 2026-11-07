import { ApiError } from '@/api/ApiResponse.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { Signal } from '@/reactive/Signal.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { user } from '@/store/User.ts';
import {
  ERROR_CODES,
  ERROR_HINTS,
  ERROR_MESSAGES,
  type ErrorCodes,
} from '@/api/error.constants.ts';
import type { LoginData, LoginFieldErrors } from '@/api/auth/auth.types.ts';
import {
  validateEmail,
  validateForbiddenChars,
  validateMultiple,
  validatePassword,
} from '@/helpers/Validation.ts';

const NETWORK_OR_SERVER_ERRORS: ErrorCodes[] = [
  ERROR_CODES.NETWORK_ERROR,
  ERROR_CODES.INTERNAL_ERROR,
];

/**
 * Определяет, какой код ошибки показать пользователю.
 *
 * 1. Если бэк вернул 401 или 400 — это неверные креды.
 * 2. Если бэк вернул сетевую/серверную ошибку — показываем её как есть.
 * 3. Всё остальное — INTERNAL_ERROR.
 */
function resolveErrorCode(result: ApiError): ErrorCodes {
  const isCredentialsError =
    result.code === ERROR_CODES.UNAUTHORIZED ||
    result.code === ERROR_CODES.INVALID_CREDENTIALS ||
    result.status === STATUSES.BAD_REQUEST;

  if (isCredentialsError) return ERROR_CODES.INVALID_CREDENTIALS;

  const knownError = NETWORK_OR_SERVER_ERRORS.find((code) => code === result.code);

  return knownError ?? ERROR_CODES.INTERNAL_ERROR;
}

/**
 * Модель страницы входа.
 *
 * Связь с View:
 * - View → Model: EventBus (`login:submit`, `login:field-change`).
 * - Model → View: Signal (View подписан на изменения стейта).
 * - Model → кто угодно: EventBus (`login:success`).
 */
export class LoginPageModel {
  readonly fieldErrors = new Signal<LoginFieldErrors>({});
  readonly generalError = new Signal<string>('');
  readonly generalErrorHint = new Signal<string>('');
  readonly loading = new Signal<boolean>(false);

  values: LoginData = {
    email: '',
    password: '',
  };

  private readonly offSubmit: () => void;
  private readonly offFieldChange: () => void;

  constructor() {
    this.offSubmit = eventBus.on('login:submit', () => {
      void this.submit();
    });

    this.offFieldChange = eventBus.on('login:field-change', ({ field, value }) => {
      this.setField(field, value);
    });
  }

  destroy(): void {
    this.offSubmit();
    this.offFieldChange();
  }

  private setField(field: keyof LoginData, value: string): void {
    this.values[field] = value;

    if (field in this.fieldErrors.value) {
      this.fieldErrors.value = Object.fromEntries(
        Object.entries(this.fieldErrors.value).filter(([key]) => key !== field),
      );
    }

    this.generalError.value = '';
    this.generalErrorHint.value = '';
  }

  private async submit(): Promise<void> {
    if (this.loading.value) return;

    this.fieldErrors.value = {};
    this.generalError.value = '';
    this.generalErrorHint.value = '';

    const emailError = validateMultiple([validateEmail, validateForbiddenChars], this.values.email);
    const passwordError = validateMultiple(
      [validatePassword, validateForbiddenChars],
      this.values.password,
    );

    if (emailError || passwordError) {
      this.fieldErrors.value = {
        ...(emailError ? { email: emailError } : {}),
        ...(passwordError ? { password: passwordError } : {}),
      };
      return;
    }

    this.loading.value = true;
    const result = await user.login(this.values);
    this.loading.value = false;

    if (result instanceof ApiError) {
      const errorCode = resolveErrorCode(result);

      this.generalError.value =
        ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
      this.generalErrorHint.value =
        ERROR_HINTS[errorCode] ?? ERROR_HINTS[ERROR_CODES.UNKNOWN_ERROR];

      return;
    }

    eventBus.emit('login:success');
  }
}
